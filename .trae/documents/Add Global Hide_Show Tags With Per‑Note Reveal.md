**Overview**

* Add a global preference to hide tags everywhere, with a clear control to show them later.

* Keep filtering and timelines functional; when hidden, show a compact control to restore tags.

* Provide a per-note quick reveal so users can temporarily view tags on a single note.

**Where Tags Are Today**

* Parse hashtags in `src/screens/MainScreen.tsx:29-38` (`extractTagsFromText`).

* Store on each note (`tags: string[]`) in `src/context/NoteContext.tsx:11-18` and use `addNote` in `src/context/NoteContext.tsx:67-80`.

* Render inside notes in `src/components/NoteItem.tsx:89-97`.

* Render filter chips in `src/components/TagsFilter.tsx:14-31`.

* Tag timelines use `getNotesByTag` from `src/context/NoteContext.tsx:88-90` and display notes in `src/screens/TagTimelineScreen.tsx:26-39`.

**Implementation**

* Add `showTags` preference (default true) to the notes context and persist it.

  * Extend context: `showTags: boolean`, `setShowTags(show: boolean)`, `toggleShowTags(): Promise<void>`.

  * State: `const [showTags, setShowTags] = useState(true)` near `src/context/NoteContext.tsx:38`.

  * Load/save with `AsyncStorage` using key `chronochat_show_tags` alongside notes (use pattern at `src/context/NoteContext.tsx:44-65`).

  * Provide in context value at `src/context/NoteContext.tsx:92-101`.

* Hide tags in notes while allowing per-note reveal.

  * In `src/components/NoteItem.tsx:89-97`, gate tag rendering behind `showTags || revealTags`.

  * Add local state `const [revealTags, setRevealTags] = useState(false)` at `src/components/NoteItem.tsx:14-16` region.

  * When `showTags` is false and `note.tags.length > 0`, render a small button (e.g., “Show tags”) near `src/components/NoteItem.tsx:98-103` to toggle `revealTags`.

* Add a global toggle in the tags filter bar.

  * Update `src/components/TagsFilter.tsx:10-31` to import `useNotes()` and read `showTags`/`toggleShowTags`.

  * When `showTags` is false, render only a single pill “Show Tags”; when true, render “Hide Tags” pill and the chips.

  * Always render the toggle even if there are no tags; move the early return at `src/components/TagsFilter.tsx:11` to allow the button.

* Keep tag timelines unchanged (title and filtering stay), but tags inside notes respect the global preference via `NoteItem`.

**Persistence & UX Details**

* Persist `showTags` in `AsyncStorage` (`chronochat_show_tags`) so preference survives app restarts.

* Use pill/button styling consistent with existing components: same radius/colors as chips.

* No new files; all changes are localized to the three existing files above.

**Search/Refactor Safety**

* Use ast-grep to locate tag rendering and filter usage patterns for consistent updates across components.

  * Match JSX blocks rendering `note.tags.map` and chip classes to ensure no missed instances.

**Validation (iOS Simulator, Metro already running)**

* Toggle the new pill on the filter bar: confirm notes hide/show tag chips.

* Confirm per-note “Show tags” reveals tags temporarily when global hide is active.

* Restart app to confirm `showTags` persists.

* Verify tag timelines still work and respect per-note reveal inside items.

**Deliverables**

* Updated `NoteContext` with `showTags` preference persisted.

* Updated `NoteItem` with conditional tags and per-note reveal.

* Updated `TagsFilter` with a global Hide/Show toggle and resilient rendering.

