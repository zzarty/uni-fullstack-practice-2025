(function() {
    function parseProduct(content) {
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
                    let value = match[2].trim();
                    if (value === 'true') value = true;
                    else if (value === 'false') value = false;
                    else if (match[1] === 'price' && !isNaN(value)) value = Number(value);
                    
                    frontmatter[match[1]] = value;
                }
            } else if (frontmatterEnded && line) {
                body.push(line);
            }
        }
        
        return {
            category: frontmatter.category || 'Uncategorized',
            title: frontmatter.title || 'Untitled Product',
            price: frontmatter.price || 0,
            currency: frontmatter.currency || 'USD',
            image: frontmatter.image || '[Product]',
            inStock: frontmatter.inStock !== false,
            featured: frontmatter.featured === true,
            description: body.join(' ').trim()
        };
    }

    function createProductItem(product) {
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        const stockClass = product.inStock ? '' : ' goods__item--out-of-stock';
        const priceDisplay = `$${product.price} ${product.currency}`;
        
        let imageHtml;
        if (product.image && (product.image.startsWith('http') || product.image.startsWith('/') || product.image.startsWith('.'))) {
            imageHtml = `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" />`;
        } else {
            imageHtml = escapeHtml(product.image);
        }
        
        return `
            <div class="goods__item${stockClass}">
                <div class="goods__image">${imageHtml}</div>
                <h3>${escapeHtml(product.title)}</h3>
                <p>${escapeHtml(product.description)}</p>
                <div class="goods__price">${escapeHtml(priceDisplay)}</div>
                <button class="button button--buy" ${!product.inStock ? 'disabled' : ''}>
                    ${product.inStock ? 'В корзину' : 'Нет в наличии'}
                </button>
            </div>
        `;
    }

    function groupByCategory(products) {
        const categories = {};
        
        products.forEach(product => {
            if (!categories[product.category]) {
                categories[product.category] = [];
            }
            categories[product.category].push(product);
        });
        
        return categories;
    }

    function createCategorySection(categoryName, products) {
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        const productsHtml = products.map(createProductItem).join('');
        
        return `
            <div class="goods__category">
                <h2>${escapeHtml(categoryName)}</h2>
                <div class="goods__items">
                    ${productsHtml}
                </div>
            </div>
        `;
    }

    async function loadShop() {
        const goodsSection = document.querySelector('.goods');
        if (!goodsSection) return;

        try {
            if (!window.contentIndex || !window.contentIndex.shop) {
                throw new Error('Content index not loaded. Make sure content-index.js is included before this script.');
            }
            
            const productFiles = window.contentIndex.shop.map(filename => `content/shop/${filename}.md`);

            if (productFiles.length === 0) {
                const goodsGrid = goodsSection.querySelector('.goods__grid');
                if (goodsGrid) {
                    goodsGrid.innerHTML = '<p style="opacity: 0.5;">Товаров пока нет</p>';
                }
                return;
            }

            function fetchWithFallback(relativeFile) {
                const candidates = [];

                candidates.push(relativeFile);

                candidates.push('../' + relativeFile);

                try {
                    const segments = location.pathname.split('/').filter(Boolean);
                    if (segments.length > 0) {
                        const repoBase = '/' + segments[0];
                        candidates.push(location.origin + repoBase + '/' + relativeFile);
                    }
                } catch (e) {
                    // ignore
                }

                candidates.push(location.origin + '/' + relativeFile);

                let lastErr = null;
                return (async () => {
                    for (const url of candidates) {
                        try {
                            const res = await fetch(url);
                            if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
                            return res.text();
                        } catch (err) {
                            lastErr = err;
                        }
                    }
                    throw lastErr || new Error(`Failed to fetch ${relativeFile}`);
                })();
            }

            const promises = productFiles.map(file =>
                fetchWithFallback(file).then(parseProduct)
            );

            const products = await Promise.all(promises);
            
            const categories = groupByCategory(products);
            
            const loadingMsg = goodsSection.querySelector('.goods__loading');
            if (loadingMsg) loadingMsg.remove();
            
            let goodsGrid = goodsSection.querySelector('.goods__grid');
            if (!goodsGrid) {
                goodsGrid = document.createElement('div');
                goodsGrid.className = 'goods__grid';
                goodsSection.appendChild(goodsGrid);
            }
            
            goodsGrid.innerHTML = '';
            
            Object.keys(categories).forEach(categoryName => {
                const categoryHtml = createCategorySection(categoryName, categories[categoryName]);
                goodsGrid.insertAdjacentHTML('beforeend', categoryHtml);
            });
            
        } catch (error) {
            console.error('Error loading shop:', error);
            
            const loadingMsg = goodsSection.querySelector('.goods__loading');
            if (loadingMsg) loadingMsg.remove();
            
            const goodsGrid = goodsSection.querySelector('.goods__grid');
            if (goodsGrid) {
                goodsGrid.insertAdjacentHTML('beforeend', 
                    '<p style="opacity: 0.5;">Ошибка загрузки товаров</p>'
                );
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadShop);
    } else {
        loadShop();
    }
})();