import json
from collections.abc import Mapping
from dataclasses import dataclass
from datetime import UTC, datetime
from decimal import Decimal
from hashlib import sha256
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from followread_api.cli.seed_demo_story import seed_demo_story
from followread_api.config import Settings, get_settings
from followread_api.database import create_session_factory, get_database_engine
from followread_api.models import (
    Audience,
    Category,
    Chapter,
    ContentTranslation,
    ContentType,
    ContentVersion,
    EditorialStatus,
    Illustration,
    JobStatus,
    Language,
    Paragraph,
    Publication,
    ReadingContent,
    ReadingLevel,
    ReadingLevelCode,
    ResourceStatus,
)
from followread_api.services import (
    FakePollyAdapter,
    LocalAudioStorage,
    OpenAITtsAdapter,
    PollyAdapter,
    PollyProcessingService,
    ReaderPackageService,
    RetryingPollyAdapter,
)
from followread_api.services.package_integrity import reader_package_checksum


@dataclass(frozen=True)
class ParagraphSpec:
    stable_key: str
    text: str


@dataclass(frozen=True)
class ChapterSpec:
    stable_key: str
    title: str
    paragraphs: tuple[ParagraphSpec, ...]


@dataclass(frozen=True)
class TranslationSpec:
    title: str
    summary: str
    chapters: tuple[ChapterSpec, ...]


@dataclass(frozen=True)
class ContentSpec:
    slug: str
    content_type: ContentType
    audience: Audience
    level_code: ReadingLevelCode
    level_label: str
    level_order: int
    category_slug: str
    category_name: str
    cover_filename: str
    cover_alt_text: str
    translations: Mapping[Language, TranslationSpec]

    @property
    def cover_uri(self) -> str:
        return f"/stories/{self.cover_filename}"


ADDITIONAL_CONTENT = (
    ContentSpec(
        slug="the-river-between-us",
        content_type=ContentType.LESSON,
        audience=Audience.ALL,
        level_code=ReadingLevelCode.INTERMEDIATE,
        level_label="Intermedio",
        level_order=2,
        category_slug="colaboracion",
        category_name="Colaboración",
        cover_filename="the-river-between-us-cover.png",
        cover_alt_text=(
            "Dos hermanos guían un pequeño barco de papel por un río hacia un puente de madera."
        ),
        translations={
            Language.SPANISH: TranslationSpec(
                title="El río entre nosotros",
                summary=(
                    "Ana y Tomás descubren que observar, escuchar y colaborar "
                    "puede unir dos orillas."
                ),
                chapters=(
                    ChapterSpec(
                        stable_key="chapter-1",
                        title="Dos orillas",
                        paragraphs=(
                            ParagraphSpec(
                                "paragraph-1",
                                "Ana estudiaba las plantas de una orilla y Tomás observaba las "
                                "piedras desde la otra.",
                            ),
                            ParagraphSpec(
                                "paragraph-2",
                                "Los dos querían llevar una semilla al vivero del pueblo, pero la "
                                "corriente era demasiado rápida para cruzar solos.",
                            ),
                            ParagraphSpec(
                                "paragraph-3",
                                "Entonces pusieron la semilla en un barco de papel y acordaron "
                                "guiarlo juntos hasta el puente.",
                            ),
                        ),
                    ),
                    ChapterSpec(
                        stable_key="chapter-2",
                        title="El puente que escuchaba",
                        paragraphs=(
                            ParagraphSpec(
                                "paragraph-4",
                                "Ana avisaba dónde el agua era tranquila y Tomás señalaba las "
                                "piedras que podían desviar el barco.",
                            ),
                            ParagraphSpec(
                                "paragraph-5",
                                "Cuando dejaron de competir y comenzaron a escucharse, la pequeña "
                                "embarcación encontró un camino seguro.",
                            ),
                            ParagraphSpec(
                                "paragraph-6",
                                "Plantaron la semilla junto al puente y comprendieron que una idea "
                                "crece mejor cuando recibe cuidado desde ambos lados.",
                            ),
                        ),
                    ),
                ),
            ),
            Language.ENGLISH: TranslationSpec(
                title="The River Between Us",
                summary=(
                    "Ana and Tomás discover that observing, listening, and cooperating can connect "
                    "two riverbanks."
                ),
                chapters=(
                    ChapterSpec(
                        stable_key="chapter-1",
                        title="Two Riverbanks",
                        paragraphs=(
                            ParagraphSpec(
                                "paragraph-1",
                                "Ana studied the plants on one bank while Tomás examined "
                                "the stones "
                                "from the other.",
                            ),
                            ParagraphSpec(
                                "paragraph-2",
                                "They both wanted to carry a seed to the village nursery, but the "
                                "current was too fast to cross alone.",
                            ),
                            ParagraphSpec(
                                "paragraph-3",
                                "They placed the seed in a paper boat and agreed to guide it "
                                "together toward the bridge.",
                            ),
                        ),
                    ),
                    ChapterSpec(
                        stable_key="chapter-2",
                        title="The Listening Bridge",
                        paragraphs=(
                            ParagraphSpec(
                                "paragraph-4",
                                "Ana called out where the water was calm, and Tomás pointed to the "
                                "stones that could turn the boat.",
                            ),
                            ParagraphSpec(
                                "paragraph-5",
                                "When they stopped competing and started listening, "
                                "the little boat "
                                "found a safe path.",
                            ),
                            ParagraphSpec(
                                "paragraph-6",
                                "They planted the seed beside the bridge and learned that an idea "
                                "grows best when both sides care for it.",
                            ),
                        ),
                    ),
                ),
            ),
        },
    ),
    ContentSpec(
        slug="el-jardin-secreto",
        content_type=ContentType.ARTICLE,
        audience=Audience.ADULT,
        level_code=ReadingLevelCode.UPPER_INTERMEDIATE,
        level_label="Intermedio alto",
        level_order=3,
        category_slug="naturaleza",
        category_name="Naturaleza",
        cover_filename="el-jardin-secreto-cover.png",
        cover_alt_text=(
            "Una mujer abre una puerta verde hacia un jardín urbano "
            "lleno de plantas y polinizadores."
        ),
        translations={
            Language.SPANISH: TranslationSpec(
                title="El jardín secreto",
                summary=(
                    "Un pequeño patio urbano demuestra cómo la biodiversidad también puede "
                    "recuperar espacios cotidianos."
                ),
                chapters=(
                    ChapterSpec(
                        stable_key="chapter-1",
                        title="Un refugio entre edificios",
                        paragraphs=(
                            ParagraphSpec(
                                "paragraph-1",
                                "Detrás de una puerta verde, Marta encontró un patio "
                                "que los vecinos "
                                "habían transformado con plantas nativas.",
                            ),
                            ParagraphSpec(
                                "paragraph-2",
                                "Un depósito recogía la lluvia del tejado y varias "
                                "macetas ofrecían "
                                "flores en distintas épocas del año.",
                            ),
                            ParagraphSpec(
                                "paragraph-3",
                                "Abejas pequeñas, mariposas y aves visitaban aquel espacio porque "
                                "encontraban agua, alimento y refugio.",
                            ),
                        ),
                    ),
                    ChapterSpec(
                        stable_key="chapter-2",
                        title="Un jardín compartido",
                        paragraphs=(
                            ParagraphSpec(
                                "paragraph-4",
                                "El grupo evitaba pesticidas, dejaba algunas hojas secas y anotaba "
                                "qué especies aparecían cada semana.",
                            ),
                            ParagraphSpec(
                                "paragraph-5",
                                "También compartía semillas y turnos de riego para "
                                "que el jardín no "
                                "dependiera de una sola persona.",
                            ),
                            ParagraphSpec(
                                "paragraph-6",
                                "El patio seguía siendo pequeño, pero ahora conectaba "
                                "a los vecinos "
                                "con los ciclos de la ciudad y con los seres que la habitan.",
                            ),
                        ),
                    ),
                ),
            ),
            Language.ENGLISH: TranslationSpec(
                title="The Secret Garden",
                summary=(
                    "A small urban courtyard shows how biodiversity can restore everyday spaces."
                ),
                chapters=(
                    ChapterSpec(
                        stable_key="chapter-1",
                        title="A Refuge Between Buildings",
                        paragraphs=(
                            ParagraphSpec(
                                "paragraph-1",
                                "Behind a green door, Marta found a courtyard that "
                                "the neighbors had "
                                "transformed with native plants.",
                            ),
                            ParagraphSpec(
                                "paragraph-2",
                                "A barrel collected rain from the roof, and many pots offered "
                                "flowers during different seasons.",
                            ),
                            ParagraphSpec(
                                "paragraph-3",
                                "Small bees, butterflies, and birds visited because they found "
                                "water, food, and shelter there.",
                            ),
                        ),
                    ),
                    ChapterSpec(
                        stable_key="chapter-2",
                        title="A Shared Garden",
                        paragraphs=(
                            ParagraphSpec(
                                "paragraph-4",
                                "The group avoided pesticides, left some dry leaves, and recorded "
                                "which species appeared each week.",
                            ),
                            ParagraphSpec(
                                "paragraph-5",
                                "They also shared seeds and watering shifts so the "
                                "garden would not "
                                "depend on one person.",
                            ),
                            ParagraphSpec(
                                "paragraph-6",
                                "The courtyard remained small, but it now connected the neighbors "
                                "with the city's seasons and living creatures.",
                            ),
                        ),
                    ),
                ),
            ),
        },
    ),
    ContentSpec(
        slug="la-casa-de-los-sonidos",
        content_type=ContentType.STORY,
        audience=Audience.CHILDREN,
        level_code=ReadingLevelCode.ELEMENTARY,
        level_label="Elemental",
        level_order=1,
        category_slug="curiosidad",
        category_name="Curiosidad",
        cover_filename="la-casa-de-los-sonidos-cover.png",
        cover_alt_text=(
            "Nia recorre una casa acogedora mientras una cinta luminosa representa sus sonidos."
        ),
        translations={
            Language.SPANISH: TranslationSpec(
                title="La casa de los sonidos",
                summary="Nia aprende que una casa puede contar historias cuando alguien escucha.",
                chapters=(
                    ChapterSpec(
                        stable_key="chapter-1",
                        title="La casa despierta",
                        paragraphs=(
                            ParagraphSpec(
                                "paragraph-1",
                                "Nia pasó la noche en casa de su abuela y oyó un tic tac detrás de "
                                "la puerta.",
                            ),
                            ParagraphSpec(
                                "paragraph-2",
                                "La tetera silbó en la cocina, la lluvia tocó la "
                                "ventana y un escalón "
                                "respondió con un crujido.",
                            ),
                            ParagraphSpec(
                                "paragraph-3",
                                "En vez de asustarse, Nia encendió su linterna y "
                                "siguió cada sonido "
                                "como si fuera una pista.",
                            ),
                        ),
                    ),
                    ChapterSpec(
                        stable_key="chapter-2",
                        title="La canción escondida",
                        paragraphs=(
                            ParagraphSpec(
                                "paragraph-4",
                                "Nia marcó el ritmo del reloj con los dedos y añadió el golpeteo "
                                "suave de la lluvia.",
                            ),
                            ParagraphSpec(
                                "paragraph-5",
                                "Su abuela acompañó la melodía con dos cucharas de "
                                "madera y la casa "
                                "pareció cantar con ellas.",
                            ),
                            ParagraphSpec(
                                "paragraph-6",
                                "Antes de dormir, Nia entendió que escuchar con atención convierte "
                                "los ruidos conocidos en una historia nueva.",
                            ),
                        ),
                    ),
                ),
            ),
            Language.ENGLISH: TranslationSpec(
                title="The House of Sounds",
                summary="Nia learns that a house can tell stories when someone listens closely.",
                chapters=(
                    ChapterSpec(
                        stable_key="chapter-1",
                        title="The House Awakens",
                        paragraphs=(
                            ParagraphSpec(
                                "paragraph-1",
                                "Nia spent the night at her grandmother's house and heard a tick "
                                "tock behind the door.",
                            ),
                            ParagraphSpec(
                                "paragraph-2",
                                "The kettle whistled in the kitchen, rain tapped the window, and a "
                                "stair answered with a creak.",
                            ),
                            ParagraphSpec(
                                "paragraph-3",
                                "Instead of feeling afraid, Nia switched on her "
                                "lantern and followed "
                                "each sound like a clue.",
                            ),
                        ),
                    ),
                    ChapterSpec(
                        stable_key="chapter-2",
                        title="The Hidden Song",
                        paragraphs=(
                            ParagraphSpec(
                                "paragraph-4",
                                "Nia tapped the clock's rhythm with her fingers and "
                                "added the gentle "
                                "beat of the rain.",
                            ),
                            ParagraphSpec(
                                "paragraph-5",
                                "Her grandmother joined with two wooden spoons, and "
                                "the house seemed "
                                "to sing with them.",
                            ),
                            ParagraphSpec(
                                "paragraph-6",
                                "Before sleeping, Nia understood that careful listening can turn "
                                "familiar noises into a new story.",
                            ),
                        ),
                    ),
                ),
            ),
        },
    ),
)


def seed_additional_catalog(
    session: Session,
    *,
    stories_dir: Path,
    audio_output_dir: Path,
    adapter: PollyAdapter | None = None,
    voices: Mapping[Language, str] | None = None,
    public_audio: bool = False,
) -> tuple[tuple[ReadingContent, ...], int]:
    selected_adapter = adapter or FakePollyAdapter()
    selected_voices = voices or {
        Language.SPANISH: "Lucia",
        Language.ENGLISH: "Joanna",
    }
    processor = PollyProcessingService(
        session,
        adapter=selected_adapter,
        storage=LocalAudioStorage(
            audio_output_dir,
            public_prefix="/audio" if public_audio else None,
        ),
        chunk_characters=1500,
        maximum_cost=Decimal("1.00"),
    )
    contents: list[ReadingContent] = []
    created_count = 0
    for spec in ADDITIONAL_CONTENT:
        content, created = _seed_content(
            session,
            spec=spec,
            stories_dir=stories_dir,
            processor=processor,
            voices=selected_voices,
        )
        contents.append(content)
        created_count += int(created)
    return tuple(contents), created_count


def _seed_content(
    session: Session,
    *,
    spec: ContentSpec,
    stories_dir: Path,
    processor: PollyProcessingService,
    voices: Mapping[Language, str],
) -> tuple[ReadingContent, bool]:
    existing = session.scalar(select(ReadingContent).where(ReadingContent.slug == spec.slug))
    created = existing is None
    if existing is None:
        level = _reading_level(session, spec)
        category = _category(session, spec)
        version = ContentVersion(
            version_number=1,
            status=EditorialStatus.APPROVED,
            checksum=_content_checksum(spec),
            package_url=f"/catalog/{spec.slug}/reader-package",
            minimum_app_version="1.0.0",
            translations=[
                ContentTranslation(
                    language=language,
                    title=translation.title,
                    summary=translation.summary,
                    chapters=[
                        Chapter(
                            stable_key=chapter.stable_key,
                            position=chapter_position,
                            title=chapter.title,
                            paragraphs=[
                                Paragraph(
                                    stable_key=paragraph.stable_key,
                                    position=paragraph_position,
                                    text=paragraph.text,
                                )
                                for paragraph_position, paragraph in enumerate(chapter.paragraphs)
                            ],
                        )
                        for chapter_position, chapter in enumerate(translation.chapters)
                    ],
                )
                for language, translation in spec.translations.items()
            ],
        )
        content = ReadingContent(
            slug=spec.slug,
            content_type=spec.content_type,
            audience=spec.audience,
            reading_level=level,
            categories=[category],
            versions=[version],
        )
        session.add(content)
        session.commit()
    else:
        content = existing
        version = (
            content.publication.version
            if content.publication is not None
            else max(content.versions, key=lambda item: item.version_number)
        )

    _process_audio(
        version=version,
        processor=processor,
        voices=voices,
        slug=spec.slug,
    )
    _upsert_cover(
        session,
        version=version,
        source_path=stories_dir / spec.cover_filename,
        public_uri=spec.cover_uri,
        alt_text=spec.cover_alt_text,
    )
    version.status = EditorialStatus.PUBLISHED
    if content.publication is None:
        session.add(
            Publication(
                content=content,
                version=version,
                is_active=True,
                published_at=datetime.now(UTC),
            ),
        )
    session.commit()
    version.checksum = reader_package_checksum(ReaderPackageService(session).get_package(spec.slug))
    session.commit()
    return content, created


def _process_audio(
    *,
    version: ContentVersion,
    processor: PollyProcessingService,
    voices: Mapping[Language, str],
    slug: str,
) -> None:
    for language in (Language.SPANISH, Language.ENGLISH):
        voice = voices[language]
        job = processor.process(
            content_version_id=version.id,
            language=language,
            voice_id=voice,
            idempotency_key=f"demo-catalog-{slug}-{language.value}-{voice}-v1",
        )
        if job.status == JobStatus.FAILED:
            job = processor.retry(job.id)
        if job.status != JobStatus.SUCCEEDED:
            raise RuntimeError(f"Audio failed for {slug}/{language.value}: {job.error_detail}")


def _reading_level(session: Session, spec: ContentSpec) -> ReadingLevel:
    level = session.scalar(select(ReadingLevel).where(ReadingLevel.code == spec.level_code))
    if level is None:
        level = ReadingLevel(
            code=spec.level_code,
            label=spec.level_label,
            display_order=spec.level_order,
        )
        session.add(level)
    return level


def _category(session: Session, spec: ContentSpec) -> Category:
    category = session.scalar(select(Category).where(Category.slug == spec.category_slug))
    if category is None:
        category = Category(slug=spec.category_slug, name=spec.category_name)
        session.add(category)
    return category


def _upsert_cover(
    session: Session,
    *,
    version: ContentVersion,
    source_path: Path,
    public_uri: str,
    alt_text: str,
) -> None:
    if not source_path.is_file():
        raise FileNotFoundError(f"Missing catalog cover: {source_path}")
    illustration = session.scalar(
        select(Illustration).where(
            Illustration.content_version_id == version.id,
            Illustration.position == 0,
        ),
    )
    if illustration is None:
        illustration = Illustration(content_version_id=version.id, position=0)
        session.add(illustration)
    illustration.uri = public_uri
    illustration.checksum = f"sha256:{sha256(source_path.read_bytes()).hexdigest()}"
    illustration.alt_text = alt_text
    illustration.status = ResourceStatus.READY


def _content_checksum(spec: ContentSpec) -> str:
    payload = {
        "slug": spec.slug,
        "translations": {
            language.value: {
                "title": translation.title,
                "summary": translation.summary,
                "chapters": [
                    {
                        "stable_key": chapter.stable_key,
                        "title": chapter.title,
                        "paragraphs": [
                            {
                                "stable_key": paragraph.stable_key,
                                "text": paragraph.text,
                            }
                            for paragraph in chapter.paragraphs
                        ],
                    }
                    for chapter in translation.chapters
                ],
            }
            for language, translation in spec.translations.items()
        },
    }
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True).encode()
    return f"sha256:{sha256(encoded).hexdigest()}"


def _runtime_adapter(
    settings: Settings,
) -> tuple[PollyAdapter, Mapping[Language, str], bool]:
    if settings.polly_provider == "openai":
        if settings.openai_api_key is None:
            raise RuntimeError("OPENAI_API_KEY is required for the configured OpenAI provider.")
        adapter: PollyAdapter = RetryingPollyAdapter(
            OpenAITtsAdapter(
                settings.openai_api_key.get_secret_value(),
                tts_model=settings.openai_tts_model,
                alignment_model=settings.openai_alignment_model,
            ),
        )
        return (
            adapter,
            {Language.SPANISH: "marin", Language.ENGLISH: "cedar"},
            True,
        )
    return (
        FakePollyAdapter(),
        {Language.SPANISH: "Lucia", Language.ENGLISH: "Joanna"},
        False,
    )


def main() -> int:
    repository_root = Path(__file__).resolve().parents[5]
    stories_dir = repository_root / "apps" / "reader" / "public" / "stories"
    settings = get_settings()
    adapter, voices, public_audio = _runtime_adapter(settings)
    session_factory = create_session_factory(get_database_engine())
    with session_factory() as session:
        fox_story, _ = seed_demo_story(
            session,
            cover_path=stories_dir / "el-zorro-y-la-luna-cover.png",
            chapter_two_path=stories_dir / "el-zorro-y-la-luna-chapter-2.png",
            audio_output_dir=Path(settings.audio_output_dir),
        )
        if public_audio:
            if fox_story.publication is None:
                raise RuntimeError("The main demo story was not published.")
            _process_audio(
                version=fox_story.publication.version,
                processor=PollyProcessingService(
                    session,
                    adapter=adapter,
                    storage=LocalAudioStorage(
                        settings.audio_output_dir,
                        public_prefix="/audio",
                    ),
                    chunk_characters=settings.polly_chunk_characters,
                    maximum_cost=settings.maximum_processing_cost,
                ),
                voices=voices,
                slug=fox_story.slug,
            )
        contents, created_count = seed_additional_catalog(
            session,
            stories_dir=stories_dir,
            audio_output_dir=Path(settings.audio_output_dir),
            adapter=adapter,
            voices=voices,
            public_audio=public_audio,
        )
    print(
        f"Demo catalog ready: {len(contents) + 1} published readings, "
        f"{created_count} newly created."
    )
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
