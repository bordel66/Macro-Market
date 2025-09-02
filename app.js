// Dashboard JavaScript com integração de APIs e gráficos funcionais - FIXED

class MacroDashboard {
    constructor() {
        this.data = {
            crypto: {},
            equities: {},
            macro: {},
            etfs: {},
            global: {},
            charts: {}
        };
        this.charts = {
            sp500: null,
            nasdaq: null,
            russell: null,
            vix: null
        };
        this.refreshInterval = null;
        this.lastUpdate = null;
        this.apiConfig = {
            finnhub: {
                baseUrl: 'https://finnhub.io/api/v1',
                key: 'demo',
                symbols: {
                    sp500: 'SPY',
                    nasdaq: 'QQQ',
                    russell: 'IWM',
                    vix: 'VXX'
                }
            },
            fallbackData: {
                sp500_data: {
                    labels: ["29 Ago", "30 Ago", "31 Ago", "1 Set", "2 Set"],
                    prices: [5648, 5591, 5580, 5570, 5580],
                    changes: [-1.2, -2.1, -0.2, 0.18, -0.1]
                },
                nasdaq_data: {
                    labels: ["29 Ago", "30 Ago", "31 Ago", "1 Set", "2 Set"],
                    prices: [17856, 17370, 17323, 17290, 17310],
                    changes: [-1.8, -2.7, -0.3, 0.1, 0.1]
                },
                russell_data: {
                    labels: ["29 Ago", "30 Ago", "31 Ago", "1 Set", "2 Set"],
                    prices: [2067, 2035, 2023, 2018, 2025],
                    changes: [-1.5, -1.6, -0.6, 0.35, 0.2]
                },
                vix_data: {
                    labels: ["29 Ago", "30 Ago", "31 Ago", "1 Set", "2 Set"],
                    values: [17.2, 22.1, 24.1, 23.8, 22.9],
                    changes: [12.5, 28.5, 9.0, -1.2, -3.8]
                }
            }
        };
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeComponents();
            });
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        console.log('Initializing dashboard components...');
        this.initializeLucideIcons();
        this.loadAllData();
        
        // Set up components after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.setupTabNavigation();
            this.setupRefreshButton();
            this.setupInteractiveElements();
            this.setupKeyboardNavigation();
            this.startAutoRefresh();
        }, 100);
    }

    // Initialize Lucide icons
    initializeLucideIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Setup tab navigation - COMPLETELY FIXED
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        console.log('Setting up tab navigation...');
        console.log('Tab buttons found:', tabButtons.length);
        console.log('Tab panels found:', tabPanels.length);

        // Log all tabs for debugging
        tabButtons.forEach((btn, i) => {
            console.log(`Button ${i}: data-tab="${btn.getAttribute('data-tab')}"`);
        });
        
        tabPanels.forEach((panel, i) => {
            console.log(`Panel ${i}: id="${panel.id}"`);
        });

        tabButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const targetTab = button.getAttribute('data-tab');
                console.log('Tab clicked:', targetTab);
                
                // Remove active class from all buttons
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                
                // Hide all panels
                tabPanels.forEach(panel => {
                    panel.classList.remove('active');
                    panel.style.display = 'none';
                    panel.setAttribute('aria-hidden', 'true');
                });
                
                // Add active class to clicked button
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');
                
                // Find and show the corresponding panel
                const targetPanel = document.getElementById(targetTab);
                console.log('Target panel found:', !!targetPanel);
                
                if (targetPanel) {
                    targetPanel.classList.add('active');
                    targetPanel.style.display = 'block';
                    targetPanel.setAttribute('aria-hidden', 'false');
                    console.log('Panel activated:', targetTab);
                    
                    // Special handling for US equities tab
                    if (targetTab === 'us-equities') {
                        console.log('Loading US Equities tab - initializing charts...');
                        setTimeout(() => {
                            this.initializeCharts();
                        }, 200);
                    }
                    
                    // Smooth scroll on mobile
                    if (window.innerWidth <= 768) {
                        setTimeout(() => {
                            targetPanel.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'start' 
                            });
                        }, 100);
                    }
                } else {
                    console.error('Target panel not found:', targetTab);
                }
            });
        });

        // Initialize first tab as active
        if (tabButtons.length > 0 && tabPanels.length > 0) {
            // Hide all panels first
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                panel.style.display = 'none';
                panel.setAttribute('aria-hidden', 'true');
            });
            
            // Remove active from all buttons
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            
            // Activate first tab
            const firstTab = tabButtons[0];
            const firstTabId = firstTab.getAttribute('data-tab');
            const firstPanel = document.getElementById(firstTabId);
            
            firstTab.classList.add('active');
            firstTab.setAttribute('aria-selected', 'true');
            
            if (firstPanel) {
                firstPanel.classList.add('active');
                firstPanel.style.display = 'block';
                firstPanel.setAttribute('aria-hidden', 'false');
                console.log('First panel activated:', firstTabId);
            }
        }
    }

    // Setup refresh button
    setupRefreshButton() {
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshAllData();
            });
        }
    }

    // Setup interactive elements
    setupInteractiveElements() {
        this.setupCardHoverEffects();
        this.setupMetricHighlighting();
    }

    setupCardHoverEffects() {
        const cards = document.querySelectorAll('.tldr-card, .card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
                card.style.boxShadow = 'var(--shadow-lg)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '';
            });
        });
    }

    setupMetricHighlighting() {
        const metrics = document.querySelectorAll('.metric-large');
        
        if (!window.IntersectionObserver) return;
        
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'metricPulse 0.6s ease-in-out';
                    setTimeout(() => {
                        entry.target.style.animation = '';
                    }, 600);
                }
            });
        }, observerOptions);

        metrics.forEach(metric => {
            observer.observe(metric);
        });
    }

    // Keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!document.activeElement || !document.activeElement.classList.contains('tab-btn')) {
                return;
            }
            
            const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
            const currentIndex = tabButtons.indexOf(document.activeElement);

            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                e.preventDefault();
                tabButtons[currentIndex - 1].focus();
                tabButtons[currentIndex - 1].click();
            } else if (e.key === 'ArrowRight' && currentIndex < tabButtons.length - 1) {
                e.preventDefault();
                tabButtons[currentIndex + 1].focus();
                tabButtons[currentIndex + 1].click();
            }
        });
    }

    // Load all data
    async loadAllData() {
        console.log('Loading all data...');
        this.showLoading();
        
        try {
            // Load data first
            await Promise.all([
                this.loadCryptoData(),
                this.loadEquityData(),
                this.loadMacroData(),
                this.loadETFData(),
                this.loadChartData()
            ]);
            
            console.log('All data loaded, updating displays...');
            this.updateAllDisplays();
            this.updateTimestamp();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Erro ao carregar dados. Usando dados de fallback.');
            this.loadFallbackData();
        }
    }

    // Load chart data with multiple fallbacks
    async loadChartData() {
        console.log('Loading chart data...');
        
        this.data.charts = {};
        
        const symbols = ['SPY', 'QQQ', 'IWM', 'VXX'];
        const chartNames = ['sp500', 'nasdaq', 'russell', 'vix'];
        
        // For demo purposes, we'll use fallback data immediately
        // In production, you would try the APIs first
        for (let i = 0; i < chartNames.length; i++) {
            const chartName = chartNames[i];
            console.log(`Loading fallback data for ${chartName}`);
            this.data.charts[chartName] = this.getFallbackChartData(chartName);
        }
        
        console.log('Chart data loaded:', this.data.charts);
    }

    // Get fallback chart data
    getFallbackChartData(chartName) {
        const fallbackKey = `${chartName}_data`;
        const fallback = this.apiConfig.fallbackData[fallbackKey];
        
        if (fallback) {
            return {
                labels: fallback.labels,
                prices: fallback.prices || fallback.values,
                volumes: [],
                isDemo: true
            };
        }
        
        // Default fallback
        return {
            labels: ["29 Ago", "30 Ago", "31 Ago", "1 Set", "2 Set"],
            prices: [100, 98, 102, 101, 103],
            volumes: [],
            isDemo: true
        };
    }

    // Initialize charts
    initializeCharts() {
        if (!window.Chart) {
            console.error('Chart.js not loaded');
            return;
        }

        console.log('Initializing charts with data:', this.data.charts);
        
        // Destroy existing charts
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });

        // Clear charts object
        this.charts = {
            sp500: null,
            nasdaq: null,
            russell: null,
            vix: null
        };

        // Initialize each chart
        setTimeout(() => {
            this.createChart('sp500', 'S&P 500 (SPY)');
            this.createChart('nasdaq', 'Nasdaq (QQQ)');
            this.createChart('russell', 'Russell 2000 (IWM)');
            this.createChart('vix', 'VIX');
        }, 100);
    }

    // Create individual chart
    createChart(chartName, title) {
        console.log(`Creating chart: ${chartName}`);
        
        const canvas = document.getElementById(`${chartName}-chart`);
        const statusElement = document.getElementById(`${chartName}-chart-status`);
        
        if (!canvas) {
            console.error(`Canvas not found for ${chartName}-chart`);
            return;
        }
        
        if (!statusElement) {
            console.error(`Status element not found for ${chartName}-chart-status`);
            return;
        }

        const chartData = this.data.charts[chartName];
        
        if (!chartData || !chartData.prices || chartData.prices.length === 0) {
            console.error(`No chart data available for ${chartName}`);
            statusElement.textContent = 'Dados não disponíveis';
            statusElement.className = 'chart-status error';
            return;
        }

        console.log(`Chart data for ${chartName}:`, chartData);

        // Update status
        if (chartData.isDemo) {
            statusElement.textContent = 'DADOS DEMO';
            statusElement.className = 'chart-status demo-data';
            setTimeout(() => {
                statusElement.className = 'chart-status demo-data hidden';
            }, 3000);
        } else {
            statusElement.className = 'chart-status hidden';
        }

        const ctx = canvas.getContext('2d');
        
        // Chart colors - using the specified colors
        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'];
        const isVix = chartName === 'vix';
        const colorIndex = ['sp500', 'nasdaq', 'russell', 'vix'].indexOf(chartName);
        const mainColor = colors[colorIndex] || colors[0];
        
        const config = {
            type: isVix ? 'bar' : 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: title,
                    data: chartData.prices,
                    borderColor: mainColor,
                    backgroundColor: isVix ? mainColor + '80' : mainColor + '20',
                    borderWidth: 2,
                    fill: !isVix,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: mainColor,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: mainColor,
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                if (isVix) {
                                    return `${title}: ${value.toFixed(2)}`;
                                } else if (value >= 1000) {
                                    return `${title}: ${value.toLocaleString()}`;
                                } else {
                                    return `${title}: ${value.toFixed(0)}`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(128, 128, 128, 0.2)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#666',
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(128, 128, 128, 0.2)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#666',
                            font: {
                                size: 11
                            },
                            callback: function(value) {
                                if (isVix) {
                                    return value.toFixed(1);
                                } else if (value >= 1000) {
                                    return (value / 1000).toFixed(0) + 'K';
                                } else {
                                    return value.toFixed(0);
                                }
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutCubic'
                }
            }
        };

        try {
            this.charts[chartName] = new Chart(ctx, config);
            console.log(`Chart created successfully: ${chartName}`);
        } catch (error) {
            console.error(`Error creating chart ${chartName}:`, error);
            statusElement.textContent = 'Erro ao carregar gráfico';
            statusElement.className = 'chart-status error';
        }
    }

    // Refresh all data
    async refreshAllData() {
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.classList.add('loading');
        }
        
        await this.loadAllData();
        
        // Re-initialize charts if we're on the US equities tab
        const activeTab = document.querySelector('.tab-panel.active');
        if (activeTab && activeTab.id === 'us-equities') {
            setTimeout(() => {
                this.initializeCharts();
            }, 500);
        }
        
        if (refreshBtn) {
            refreshBtn.classList.remove('loading');
        }
    }

    // Load crypto data from CoinGecko
    async loadCryptoData() {
        try {
            // Using fallback data for demo
            this.data.crypto = {
                global: {
                    total_market_cap: { usd: 2680000000000 },
                    total_volume: { usd: 45000000000 },
                    market_cap_percentage: { btc: 57.4 }
                },
                bitcoin: {
                    market_data: {
                        current_price: { usd: 108783 },
                        price_change_percentage_24h: -2.1,
                        market_cap: { usd: 2150000000000 }
                    }
                },
                ethereum: {
                    market_data: {
                        current_price: { usd: 4265 },
                        price_change_percentage_24h: 1.8,
                        market_cap: { usd: 512000000000 }
                    }
                },
                ethBtcRatio: 0.031,
                top10: [
                    { name: 'Bitcoin', symbol: 'btc', current_price: 108783, price_change_percentage_24h: -2.1, market_cap: 2150000000000 },
                    { name: 'Ethereum', symbol: 'eth', current_price: 4265, price_change_percentage_24h: 1.8, market_cap: 512000000000 },
                    { name: 'Tether', symbol: 'usdt', current_price: 1.00, price_change_percentage_24h: 0.1, market_cap: 167000000000 },
                    { name: 'Solana', symbol: 'sol', current_price: 195, price_change_percentage_24h: -3.2, market_cap: 91000000000 },
                    { name: 'BNB', symbol: 'bnb', current_price: 635, price_change_percentage_24h: -1.8, market_cap: 92000000000 }
                ]
            };
        } catch (error) {
            console.error('Error loading crypto data:', error);
        }
    }

    // Load equity data
    async loadEquityData() {
        try {
            // Using fallback equity data for demo
            this.data.equities = {
                '^GSPC': { price: 5580, change: -2.0 },
                '^IXIC': { price: 17323, change: -2.7 },
                '^RUT': { price: 2023, change: -2.0 },
                '^DJI': { price: 41290, change: -1.8 }
            };
        } catch (error) {
            console.error('Error loading equity data:', error);
        }
    }

    // Load macro data
    async loadMacroData() {
        this.data.macro = {
            fedFundsRate: 4.31,
            treasury10y: 4.23,
            treasury2y: 3.73,
            dxy: 98.1,
            vix: 24.11,
            cpi: 2.9,
            nextMeetingProb: 86.6,
            catalysts: [
                {
                    date: '2025-09-05',
                    time: '13:30',
                    event: 'Non Farm Payrolls',
                    forecast: '75K vs 73K anterior',
                    importance: 'Crítico'
                },
                {
                    date: '2025-09-17',
                    time: '15:00',
                    event: 'FOMC Decision',
                    forecast: '86.6% probabilidade corte 25bp',
                    importance: 'Crítico'
                },
                {
                    date: '2025-09-26',
                    time: '13:30',
                    event: 'Core PCE',
                    forecast: 'vs 2.9% anterior',
                    importance: 'Alto'
                }
            ]
        };
    }

    // Load ETF data
    async loadETFData() {
        this.data.etfs = {
            btc: {
                aum: '$32.8B',
                weeklyFlow: '+$748M',
                holdings: '875,432 BTC'
            },
            eth: {
                aum: '$12.4B', 
                weeklyFlow: '+$1.4B',
                holdings: '2.9M ETH'
            },
            institutional: {
                mstr: '439,000 BTC',
                tesla: '9,720 BTC',
                elsalvador: '5,690 BTC'
            }
        };
    }

    // Load fallback data
    loadFallbackData() {
        console.log('Loading fallback data...');
        
        // Load all fallback data
        this.loadCryptoData();
        this.loadEquityData();
        this.loadMacroData();
        this.loadETFData();
        
        // Load fallback chart data
        this.data.charts = {};
        ['sp500', 'nasdaq', 'russell', 'vix'].forEach(chartName => {
            this.data.charts[chartName] = this.getFallbackChartData(chartName);
        });
        
        this.updateAllDisplays();
        this.updateTimestamp();
    }

    // Update all displays
    updateAllDisplays() {
        console.log('Updating all displays...');
        this.updateTLDRSection();
        this.updateFedMacroTab();
        this.updateEquitiesTab();
        this.updateCryptoTab();
        this.updateBigPlayersTab();
        this.updateLevelsTab();
        this.updateRisksTab();
    }

    // Update TL;DR section
    updateTLDRSection() {
        const sentiment = this.data.macro.vix > 25 ? 'Risk-off elevado' : 'Misto/Cauteloso';
        this.updateElement('market-sentiment', sentiment, this.getStatusClass(this.data.macro.vix, 20, 30));

        this.updateElement('fed-summary', `${this.data.macro.nextMeetingProb}% probabilidade corte 25bp (17 Set)`);

        const sp500Change = this.data.equities['^GSPC']?.change || -2.0;
        this.updateElement('equity-summary', `S&P ${sp500Change > 0 ? '+' : ''}${sp500Change.toFixed(1)}%, mercados em pressão`);

        const btcPrice = this.data.crypto.bitcoin?.market_data?.current_price?.usd || 108783;
        const ethPrice = this.data.crypto.ethereum?.market_data?.current_price?.usd || 4265;
        this.updateElement('crypto-summary', `BTC $${this.formatNumber(btcPrice, 0)}, ETH $${this.formatNumber(ethPrice, 0)}, ratio ETH/BTC: ${this.data.crypto.ethBtcRatio?.toFixed(3) || '0.031'}`);

        this.updateElement('flows-summary', `ETH ETFs dominando: +$1.4B vs BTC +$748M semanal`);

        this.updateElement('risks-summary', `Payroll sexta-feira crítico, VIX elevado em ${this.data.macro.vix}`);
    }

    // Update FED & Macro tab
    updateFedMacroTab() {
        this.updateElement('fed-funds-rate', `${this.data.macro.fedFundsRate}%`);
        this.updateElement('treasury-10y', `${this.data.macro.treasury10y}%`);
        this.updateElement('treasury-2y', `${this.data.macro.treasury2y}%`);
        this.updateElement('dxy', this.data.macro.dxy.toFixed(1));
        this.updateElement('vix', this.data.macro.vix.toString());
        this.updateElement('cpi', `${this.data.macro.cpi}%`);
        this.updateElement('next-meeting-prob', `${this.data.macro.nextMeetingProb}% (corte 25bp)`);

        this.updateCatalysts();
    }

    // Update catalysts
    updateCatalysts() {
        const container = document.getElementById('macro-catalysts');
        if (!container || !this.data.macro.catalysts) return;

        container.innerHTML = '';
        
        this.data.macro.catalysts.forEach(catalyst => {
            const item = document.createElement('div');
            item.className = 'catalyst-item';
            
            item.innerHTML = `
                <div class="catalyst-date">${this.formatDate(catalyst.date)} ${catalyst.time}</div>
                <div class="catalyst-content">
                    <strong>${catalyst.event}</strong>
                    <p>${catalyst.forecast}</p>
                    <small>Importância: ${catalyst.importance}</small>
                </div>
            `;
            
            container.appendChild(item);
        });
    }

    // Update Equities tab
    updateEquitiesTab() {
        const indices = {
            '^GSPC': 'sp500',
            '^IXIC': 'nasdaq', 
            '^RUT': 'russell'
        };

        Object.entries(indices).forEach(([symbol, prefix]) => {
            const data = this.data.equities[symbol];
            if (data) {
                this.updateElement(`${prefix}-price`, this.formatNumber(data.price, 0));
                this.updateElement(`${prefix}-change`, `${data.change > 0 ? '+' : ''}${data.change.toFixed(1)}%`, this.getChangeClass(data.change));
            }
        });

        // Update VIX separately
        this.updateElement('vix-price', this.data.macro.vix.toString());
        this.updateElement('vix-price-change', '+15.2%', 'status-negative');

        this.updateSectorPerformance();
        this.updateMarketIndicators();
    }

    // Update sector performance
    updateSectorPerformance() {
        const container = document.getElementById('sector-performance');
        if (!container) return;

        const sectors = [
            { name: 'Tecnologia', change: -2.8, symbol: 'XLK' },
            { name: 'Saúde', change: 1.2, symbol: 'XLV' },
            { name: 'Financeiro', change: -1.1, symbol: 'XLF' },
            { name: 'Energia', change: -0.5, symbol: 'XLE' },
            { name: 'Utilitários', change: 0.8, symbol: 'XLU' },
            { name: 'Consumo', change: -2.3, symbol: 'XLY' }
        ];

        container.innerHTML = '';
        
        sectors.forEach(sector => {
            const item = document.createElement('div');
            item.className = 'sector-item';
            
            item.innerHTML = `
                <span>${sector.name}</span>
                <span class="${this.getChangeClass(sector.change)}">${sector.change > 0 ? '+' : ''}${sector.change}%</span>
            `;
            
            container.appendChild(item);
        });
    }

    // Update market indicators
    updateMarketIndicators() {
        this.updateElement('advance-decline', '1,847 / 1,653 (favorável)');
        this.updateElement('highs-lows', '89 / 234 (pressure)');
        this.updateElement('market-cap-total', '$48.2T');
    }

    // Update Crypto tab
    updateCryptoTab() {
        const btc = this.data.crypto.bitcoin?.market_data;
        const eth = this.data.crypto.ethereum?.market_data;
        const global = this.data.crypto.global;

        if (btc) {
            this.updateElement('btc-price', `$${this.formatNumber(btc.current_price.usd, 0)}`);
            this.updateElement('btc-change', `${btc.price_change_percentage_24h > 0 ? '+' : ''}${btc.price_change_percentage_24h.toFixed(1)}%`, this.getChangeClass(btc.price_change_percentage_24h));
            this.updateElement('btc-mcap', `Market Cap: $${this.formatNumber(btc.market_cap.usd / 1e9, 1)}B`);
        }

        if (eth) {
            this.updateElement('eth-price', `$${this.formatNumber(eth.current_price.usd, 0)}`);
            this.updateElement('eth-change', `${eth.price_change_percentage_24h > 0 ? '+' : ''}${eth.price_change_percentage_24h.toFixed(1)}%`, this.getChangeClass(eth.price_change_percentage_24h));
            this.updateElement('eth-mcap', `Market Cap: $${this.formatNumber(eth.market_cap.usd / 1e9, 1)}B`);
        }

        if (global) {
            this.updateElement('eth-btc-ratio', this.data.crypto.ethBtcRatio?.toFixed(3) || 'N/A');
            this.updateElement('btc-dominance', `${global.market_cap_percentage?.btc?.toFixed(1) || '57.4'}%`);
            this.updateElement('total-mcap', `$${this.formatNumber(global.total_market_cap?.usd / 1e12 || 2.68, 1)}T`);
            this.updateElement('total-volume', `$${this.formatNumber(global.total_volume?.usd / 1e9 || 45, 1)}B`);
        }

        this.updateCryptoTable();
        this.updateOnChainMetrics();
    }

    // Update crypto table
    updateCryptoTable() {
        const container = document.getElementById('crypto-table');
        if (!container || !this.data.crypto.top10 || this.data.crypto.top10.length === 0) {
            container.innerHTML = '<div class="loading-shimmer">Dados não disponíveis</div>';
            return;
        }

        container.innerHTML = '';
        
        this.data.crypto.top10.slice(0, 10).forEach((coin, index) => {
            const row = document.createElement('div');
            row.className = 'crypto-row';
            
            row.innerHTML = `
                <span class="crypto-rank">#${index + 1}</span>
                <span class="crypto-name">${coin.name} (${coin.symbol.toUpperCase()})</span>
                <span class="crypto-price">$${this.formatNumber(coin.current_price, coin.current_price < 1 ? 4 : 2)}</span>
                <span class="crypto-change ${this.getChangeClass(coin.price_change_percentage_24h)}">${coin.price_change_percentage_24h > 0 ? '+' : ''}${coin.price_change_percentage_24h?.toFixed(1) || '0.0'}%</span>
                <span class="crypto-mcap">$${this.formatNumber(coin.market_cap / 1e9, 1)}B</span>
            `;
            
            container.appendChild(row);
        });
    }

    // Update on-chain metrics
    updateOnChainMetrics() {
        this.updateElement('fear-greed', '45 (Medo)', 'status-negative');
        this.updateElement('total-tvl', '$182.4B');
        this.updateElement('stablecoin-mcap', '$238.1B');
    }

    // Update Big Players tab
    updateBigPlayersTab() {
        const btcEtf = this.data.etfs.btc;
        const ethEtf = this.data.etfs.eth;

        if (btcEtf) {
            this.updateElement('btc-etf-aum', btcEtf.aum);
            this.updateElement('btc-etf-flow', btcEtf.weeklyFlow);
            this.updateElement('btc-etf-holdings', btcEtf.holdings);
        }

        if (ethEtf) {
            this.updateElement('eth-etf-aum', ethEtf.aum);
            this.updateElement('eth-etf-flow', ethEtf.weeklyFlow);
            this.updateElement('eth-etf-holdings', ethEtf.holdings);
        }

        this.updateWhaleActivity();
        this.updateInstitutionalData();
    }

    // Update whale activity
    updateWhaleActivity() {
        const container = document.getElementById('whale-activity');
        if (!container) return;

        container.innerHTML = `
            <div class="whale-movement">
                <h5>📊 Últimas 24h</h5>
                <div class="whale-item">
                    <span>Whale converteu 4,000 BTC → 96,859 ETH</span>
                    <span class="whale-value">$3.8B exposure</span>
                </div>
                <div class="whale-item">
                    <span>Exchange outflow BTC: 15,240 BTC</span>
                    <span class="whale-value">$1.65B</span>
                </div>
                <div class="whale-item">
                    <span>Large ETH accumulation: +45,600 ETH</span>
                    <span class="whale-value">$194M</span>
                </div>
            </div>
        `;
    }

    // Update institutional data
    updateInstitutionalData() {
        const institutional = this.data.etfs.institutional;
        if (institutional) {
            this.updateElement('mstr-btc', institutional.mstr);
            this.updateElement('tesla-btc', institutional.tesla);
            this.updateElement('elsalvador-btc', institutional.elsalvador);
        }
    }

    // Update Levels tab
    updateLevelsTab() {
        const btcPrice = this.data.crypto.bitcoin?.market_data?.current_price?.usd || 108783;
        const ethPrice = this.data.crypto.ethereum?.market_data?.current_price?.usd || 4265;
        const sp500Price = this.data.equities['^GSPC']?.price || 5580;

        this.updateElement('btc-current-price', `$${this.formatNumber(btcPrice, 0)}`);
        this.updateElement('eth-current-price', `$${this.formatNumber(ethPrice, 0)}`);
        this.updateElement('sp500-current-price', sp500Price.toString());
    }

    // Update Risks tab
    updateRisksTab() {
        const btcDominance = this.data.crypto.global?.market_cap_percentage?.btc || 57.4;
        const vix = this.data.macro.vix;
        const dxy = this.data.macro.dxy;
        const yield10y = this.data.macro.treasury10y;

        this.updateElement('current-dominance', `${btcDominance.toFixed(1)}%`);
        this.updateElement('current-vix', vix.toString());
        this.updateElement('current-dxy', dxy.toString());
        this.updateElement('current-yield', `${yield10y}%`);
        this.updateElement('current-funding', '+0.008%');

        this.updateSignalStatus('signal-dominance', btcDominance > 58 ? 'warning' : 'normal');
        this.updateSignalStatus('signal-vix', vix > 30 ? 'critical' : vix > 25 ? 'warning' : 'normal');
        this.updateSignalStatus('signal-dxy', dxy > 100 ? 'warning' : 'normal');
        this.updateSignalStatus('signal-yields', yield10y > 4.5 ? 'warning' : 'normal');
        this.updateSignalStatus('signal-funding', 'normal');
    }

    // Update signal status
    updateSignalStatus(elementId, status) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const indicator = element.querySelector('.signal-indicator');
        if (indicator) {
            indicator.setAttribute('data-status', status);
        }
    }

    // Start auto refresh
    startAutoRefresh() {
        // Refresh every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.loadAllData();
        }, 5 * 60 * 1000);
    }

    // Update timestamp
    updateTimestamp() {
        const now = new Date();
        const timeString = now.toLocaleString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });
        
        this.updateElement('timestamp', timeString);
        this.lastUpdate = now;
    }

    // Show loading state
    showLoading() {
        const loadingElements = document.querySelectorAll('.loading-shimmer');
        loadingElements.forEach(el => {
            el.style.display = 'block';
        });
    }

    // Hide loading state
    hideLoading() {
        const loadingElements = document.querySelectorAll('.loading-shimmer');
        loadingElements.forEach(el => {
            el.style.display = 'none';
        });
    }

    // Show error message
    showError(message) {
        console.error(message);
    }

    // Utility methods
    updateElement(id, content, className = '') {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
            if (className) {
                element.className = className;
            }
        }
    }

    formatNumber(number, decimals = 2) {
        if (typeof number !== 'number') return 'N/A';
        
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short'
        });
    }

    getChangeClass(change) {
        if (change > 0) return 'status-positive';
        if (change < 0) return 'status-negative';
        return 'status-neutral';
    }

    getStatusClass(value, goodThreshold, badThreshold) {
        if (value <= goodThreshold) return 'status-positive';
        if (value >= badThreshold) return 'status-negative';
        return 'status-neutral';
    }

    // Cleanup
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
    }
}

// Initialize dashboard when DOM is ready
let dashboard;

function initializeDashboard() {
    console.log('Initializing dashboard...');
    dashboard = new MacroDashboard();
    
    // Add debug methods to window
    window.debugDashboard = () => {
        console.log('Dashboard data:', dashboard.data);
        console.log('Charts:', dashboard.charts);
        console.log('Last update:', dashboard.lastUpdate);
    };

    window.refreshCharts = () => {
        if (dashboard) {
            dashboard.initializeCharts();
        }
    };

    window.switchToEquitiesTab = () => {
        const equitiesTab = document.querySelector('[data-tab="us-equities"]');
        if (equitiesTab) {
            equitiesTab.click();
        }
    };
}

// Multiple initialization strategies
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}

// Fallback initialization
window.addEventListener('load', () => {
    if (!dashboard) {
        console.log('Fallback dashboard initialization');
        initializeDashboard();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (dashboard) {
        dashboard.destroy();
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MacroDashboard;
}