(function() {
    function parseMarkdown(content) {
        const lines = content.split('\n');
        let inFrontmatter = false;
        let frontmatterEnded = false;
        let frontmatter = {};
        let body = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line === '---') {
                if (!inFrontmatter && !frontmatterEnded) {
                    inFrontmatter = true;
                } else if (inFrontmatter) {
                    inFrontmatter = false;
                    frontmatterEnded = true;
                }
                continue;
            }
            
            if (inFrontmatter) {
                const match = line.match(/^(\w+):\s*(.+)$/);
                if (match) {
                    frontmatter[match[1]] = match[2].trim();
                }
            } else if (frontmatterEnded && line) {
                body.push(line);
            }
        }
        
        return {
            title: frontmatter.title || 'Untitled',
            date: frontmatter.date || '',
            tags: frontmatter.tags ? frontmatter.tags.split(',').map(t => t.trim()) : [],
            content: body.join(' ').trim()
        };
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}.${parts[1]}.${parts[0]}`;
        }
        return dateStr;
    }

    function createNewsItem(article) {
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        const tagsHtml = article.tags.map(tag => 
            `<span class="news__tag">${escapeHtml(tag)}</span>`
        ).join('');
        
        return `
            <article class="news__item">
                <h2>${escapeHtml(article.title)}</h2>
                <p>${escapeHtml(article.content)}</p>
                <div class="news__meta">
                    <div class="news__tags">
                        ${tagsHtml}
                    </div>
                    <div class="news__date">${escapeHtml(formatDate(article.date))}</div>
                </div>
            </article>
        `;
    }

    async function loadNews() {
        const newsSection = document.querySelector('.news');
        if (!newsSection) return;

        try {
            if (!window.contentIndex || !window.contentIndex.news) {
                throw new Error('Content index not loaded. Make sure content-index.js is included before this script.');
            }
            
            const newsFiles = window.contentIndex.news.map(filename => `content/news/${filename}.md`);

            if (newsFiles.length === 0) {
                newsSection.insertAdjacentHTML('beforeend', 
                    '<p style="opacity: 0.5;">Новостей пока нет</p>'
                );
                return;
            }

            const promises = newsFiles.map(file => 
                fetch('../' + file)
                    .then(response => {
                        if (!response.ok) throw new Error(`Failed to load ${file}`);
                        return response.text();
                    })
                    .then(parseMarkdown)
            );

            const articles = await Promise.all(promises);
            
            const loadingMsg = newsSection.querySelector('.news__loading');
            if (loadingMsg) loadingMsg.remove();
            
            const existingItems = newsSection.querySelectorAll('.news__item');
            existingItems.forEach(item => item.remove());
            
            const newsHtml = articles.map(createNewsItem).join('');
            newsSection.insertAdjacentHTML('beforeend', newsHtml);
            
        } catch (error) {
            console.error('Error loading news:', error);
            
            const loadingMsg = newsSection.querySelector('.news__loading');
            if (loadingMsg) loadingMsg.remove();
            
            newsSection.insertAdjacentHTML('beforeend', 
                '<p style="opacity: 0.5;">Ошибка загрузки новостей</p>'
            );
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNews);
    } else {
        loadNews();
    }
})();