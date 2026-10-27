<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Resume analysis and PDF generation are pure client-side modules in src/lib (ats.ts, pdf.ts); why: resume data must never leave the browser.
- PDF export embeds licensed regular and bold Unicode fonts and uses the active font metrics for wrapping and drawing; why: Portuguese text must remain selectable with consistent glyph spacing across PDF viewers.
