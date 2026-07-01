lang="en">

<head>
    <script>
        // Apply dark mode by default for new users before React loads to prevent white flash
        try { if (localStorage.getItem('ataxy_theme') !== 'light') document.documentElement.classList.add('dark'); } catch (e) { }
    