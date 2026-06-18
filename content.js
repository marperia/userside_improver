// ===== USERSIDE IMPROVER - С КНОПКОЙ ТЕЛЕФОНА =====
console.log('[Userside Improver] Скрипт загружен');

// ===== Чтение буфера обмена с fallback =====
function readClipboardWithFallback() {
    return new Promise(async (resolve) => {
        // Способ 1: execCommand('paste') — работает на HTTP c permission clipboardRead
        try {
            const tempInput = document.createElement('textarea');
            tempInput.style.position = 'fixed';
            tempInput.style.top = '-9999px';
            tempInput.style.left = '-9999px';
            document.body.appendChild(tempInput);
            tempInput.focus();
            const success = document.execCommand('paste');
            const pastedText = tempInput.value;
            document.body.removeChild(tempInput);
            if (success && pastedText) {
                resolve(pastedText);
                return;
            }
        } catch (e) {
            console.log('[Userside Improver] execCommand paste не сработал:', e);
        }

        // Способ 2: Clipboard API (только в secure context)
        if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
            try {
                const clipboardText = await navigator.clipboard.readText();
                resolve(clipboardText);
                return;
            } catch (err) {
                console.error('[Userside Improver] Clipboard API ошибка:', err);
                if (err.name === 'NotAllowedError') {
                    showNotification('❌ Нет разрешения на чтение буфера обмена', '#d83c30');
                    resolve(null);
                    return;
                }
            }
        }
    });
}

// Функция для создания кнопок вставки в opis и comment
function createPasteButton(textarea) {
    if (document.querySelector('.paste-from-clipboard-btn')) return;

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'paste-button-container';
    const secondRow = document.createElement('div');
    secondRow.className = 'paste-button-container';

    function appendToTextarea(text) {
        const currentText = textarea.value;
        textarea.value = currentText + text;
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
    }

    // Кнопка "нет отв х3"
    const btn1 = document.createElement('button');
    btn1.textContent = '📞 Нет отв х3';
    btn1.className = 'paste-from-clipboard-btn';
    btn1.type = 'button';
    btn1.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const clipText = await readClipboardWithFallback();
        if (clipText !== null) {
            appendToTextarea(clipText + ' нет ответа х3');
            showNotification('✅ "Нет ответа х3" добавлено', '#4CAF50');
        }
    });

    // Кнопка "Всё заработало"
    const btn2 = document.createElement('button');
    btn2.textContent = '✅ OK';
    btn2.className = 'paste-from-clipboard-btn';
    btn2.type = 'button';
    btn2.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        appendToTextarea('Всё заработало');
        showNotification('✅ "всё заработало" добавлено', '#4CAF50');
    });

    // Кнопка "Зарегал мак"
    const btn3 = document.createElement('button');
    btn3.textContent = '📋 Зарегал мак';
    btn3.className = 'paste-from-clipboard-btn';
    btn3.type = 'button';
    btn3.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const clipText = await readClipboardWithFallback();
        if (clipText !== null) {
            appendToTextarea('Зарегал мак ' + clipText);
            showNotification('✅ "Зарегал мак" добавлено', '#4CAF50');
        }
    });

    // Кнопка "Скинул инструкции в Максе"
    const btn4 = document.createElement('button');
    btn4.textContent = '✉️ МАХ Инс';
    btn4.className = 'paste-from-clipboard-btn';
    btn4.type = 'button';
    btn4.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const clipText = await readClipboardWithFallback();
        if (clipText !== null) {
            appendToTextarea('Скинул инструкции в Максе ' + clipText + ' ');
            showNotification('✅ "МАХ Инструкции" добавлено', '#4CAF50');
        }
    });

    // Кнопка "Отписал в Максе"
    const btn5 = document.createElement('button');
    btn5.textContent = '✍️ МАХ Отп';
    btn5.className = 'paste-from-clipboard-btn';
    btn5.type = 'button';
    btn5.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const clipText = await readClipboardWithFallback();
        if (clipText !== null) {
            appendToTextarea('Отписал в Максе ' + clipText + ' ');
            showNotification('✅ "МАХ Отписал" добавлено', '#4CAF50');
        }
    });

    buttonContainer.appendChild(btn1);
    buttonContainer.appendChild(btn2);
    buttonContainer.appendChild(btn3);
    secondRow.appendChild(btn4);
    secondRow.appendChild(btn5);
    textarea.parentElement.insertBefore(secondRow, textarea);
    textarea.parentElement.insertBefore(buttonContainer, textarea);
    console.log('[Userside Improver] Кнопки добавлены');
}

// ===== Функция для поиска и добавления кнопки телефона в таблицу =====
function findAndAddPhoneButton() {
    console.log('[Userside Improver] Поиск телефона...');

    // Ищем все строки таблицы
    const rows = document.querySelectorAll('tr');

    for (let row of rows) {
        // Получаем все дочерние ячейки строки
        const cells = row.children;

        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];

            // Ищем левую ячейку с текстом
            if (cell.textContent.includes('Дополнительные контакты для связи:')) {
                console.log('[Userside Improver] Найдена строка с контактами');

                // Берем следующую ячейку (правую) по индексу
                const phoneCell = cells[i + 1];

                if (phoneCell) {
                    const phoneText = phoneCell.textContent.trim();
                    if (phoneText.length >= 20) {
                        continue;
                    }
                    console.log('[Userside Improver] Найден номер телефона:', phoneText);

                    // Очищаем номер от всех разделителей (черточки, пробелы, скобки)
                    let cleanPhone = phoneText.replace(/[\s\-\(\)]/g, '');

                    // Извлекаем только цифры
                    const digitsOnly = cleanPhone.replace(/\D/g, '');

                    // Форматируем номер (оставляем как есть, без замены 8 на +7)
                    let formattedPhone = digitsOnly;

                    // Если номер начинается с 8 или 7, оставляем как есть
                    if (digitsOnly.startsWith('8') && digitsOnly.length === 11) {
                        formattedPhone = digitsOnly; // 89233080219
                    } else if (digitsOnly.startsWith('7') && digitsOnly.length === 11) {
                        formattedPhone = '8' + digitsOnly.substring(1); // 79233080219 -> 89233080219
                    } else if (digitsOnly.length === 10) {
                        formattedPhone = '8' + digitsOnly; // 9233080219 -> 89233080219
                    } else if (digitsOnly.length === 5) {
                        formattedPhone = "839155" + digitsOnly; // 70027 -> 83915570027
                    }

                    if (!phoneCell.querySelector('.phone-copy-btn')) {
                        const phoneButton = document.createElement('button');
                        phoneButton.textContent = '📋 Копировать телефон';
                        phoneButton.className = 'phone-copy-btn';
                        phoneButton.type = 'button';

                        phoneButton.addEventListener('click', async (event) => {
                            event.preventDefault();
                            event.stopPropagation();

                            const originalText = phoneButton.textContent;
                            // Копируем номер в том виде, как он отображается (с 8)
                            const success = await copyToClipboard(formattedPhone, phoneButton);

                            if (success) {
                                phoneButton.textContent = '✅ Скопировано!';
                                setTimeout(() => {
                                    phoneButton.textContent = originalText;
                                }, 2000);
                            } else {
                                phoneButton.textContent = '❌ Ошибка';
                                setTimeout(() => {
                                    phoneButton.textContent = originalText;
                                }, 2000);
                            }
                        });

                        phoneCell.appendChild(phoneButton);
                        console.log('[Userside Improver] Кнопка телефона добавлена, номер:', formattedPhone);
                    }
                }
                break;
            }
        }
    }
}

function findAllTextareas() {
    const allTextareas = document.querySelectorAll('textarea');
    console.log('[Userside Improver] Найдено textarea на странице:', allTextareas.length);

    allTextareas.forEach((ta, idx) => {
        console.log(`[Userside Improver] Textarea ${idx + 1}:`, {
            name: ta.name || '(нет name)',
            id: ta.id || '(нет id)',
            class: ta.className || '(нет class)'
        });
    });

    return allTextareas;
}

function extractIpAndPort(text) {
    const regex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s*(?:-?\s*(?:EPON)?\s*-?\s*)?(\d+\/\d+:\d+)/gi;
    const matches = [];
    let match;

    function isValidIp(ip) {
        const parts = ip.split('.');
        if (parts.length !== 4) return false;
        for (let part of parts) {
            const num = parseInt(part, 10);
            if (isNaN(num) || num < 0 || num > 255) return false;
        }
        return true;
    }

    function isValidPort(portStr) {
        const match = portStr.match(/(\d+)\/(\d+):(\d+)/);
        if (!match) return false;
        const maxVal = parseInt(match[3], 10);
        return maxVal <= 64;
    }

    while ((match = regex.exec(text)) !== null) {
        let ip = match[1];
        let port = match[2];

        if (isValidIp(ip) && isValidPort(port)) {
            port = port.trim();
            matches.push({ ip, port });
        }
    }

    const uniqueMatches = [];
    const seen = new Set();
    for (const match of matches) {
        const key = `${match.ip}|${match.port}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueMatches.push(match);
        }
    }

    return uniqueMatches;
}

function generateCommands(ip, port) {
    return [
        `show epon interface EPON ${port} onu ctc optical-transceiver-diagnosis`,
        `show mac address-table interface EPON ${port}`,
        `show epon interface EPON ${port} onu port 1 state`,
        `epon reboot onu interface EPON ${port}`,
        `show epon onu-information interface EPON ${port.split(':')[0]}`
    ];
}

// Универсальная функция копирования текста
async function copyToClipboard(text, button) {
    console.log('[Userside Improver] Попытка скопировать:', text);

    // Способ 1: Современный Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            console.log('[Userside Improver] Скопировано через Clipboard API');
            return true;
        } catch (err) {
            console.error('[Userside Improver] Clipboard API ошибка:', err);
        }
    }

    // Способ 2: Старый метод с textarea (fallback)
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, text.length);
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);

        if (success) {
            console.log('[Userside Improver] Скопировано через execCommand');
            return true;
        }
    } catch (err) {
        console.error('[Userside Improver] execCommand ошибка:', err);
    }

    return false;
}

function createLinkAndButtons(ip, port, index) {
    const container = document.createElement('div');
    container.className = 'telnet-extractor-container';
    container.setAttribute('data-index', index);

    // Информация о найденной паре - показываем только IP и полный порт
    const pairInfo = document.createElement('div');
    pairInfo.className = 'pair-info';
    const ips = document.createElement('strong');
    ips.textContent = ip;
    pairInfo.appendChild(ips).append(` → ${port}`);
    container.appendChild(pairInfo);

    // БЛОК КНОПОК - все одинаковые, на одной высоте
    const buttonsRow = document.createElement('div');
    buttonsRow.className = 'buttons-row';

    // Кнопка копирования IP
    const copyIpBtn = document.createElement('button');
    copyIpBtn.textContent = '📋 Копировать IP';
    copyIpBtn.className = 'copy-button';
    copyIpBtn.type = 'button';
    copyIpBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const originalText = copyIpBtn.textContent;
        const success = await copyToClipboard(ip, copyIpBtn);

        if (success) {
            copyIpBtn.textContent = '✅ IP скопирован!';
            setTimeout(() => {
                copyIpBtn.textContent = originalText;
            }, 2000);
        } else {
            copyIpBtn.textContent = '❌ Ошибка';
            setTimeout(() => {
                copyIpBtn.textContent = originalText;
            }, 2000);
        }
    });

    // Кнопка копирования порта
    const copyPortBtn = document.createElement('button');
    copyPortBtn.textContent = '📋 Копировать порт';
    copyPortBtn.className = 'copy-button';
    copyPortBtn.type = 'button';
    copyPortBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const originalText = copyPortBtn.textContent;
        const success = await copyToClipboard(port, copyPortBtn);

        if (success) {
            copyPortBtn.textContent = '✅ Порт скопирован!';
            setTimeout(() => {
                copyPortBtn.textContent = originalText;
            }, 2000);
        } else {
            copyPortBtn.textContent = '❌ Ошибка';
            setTimeout(() => {
                copyPortBtn.textContent = originalText;
            }, 2000);
        }
    });

    // Кнопка Telnet
    const telnetBtn = document.createElement('button');
    telnetBtn.textContent = '🔗 Telnet';
    telnetBtn.className = 'copy-button telnet-btn';
    telnetBtn.type = 'button';
    telnetBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.location.href = `telnet://${ip}`;
    });

    // Кнопка Zabbix
    const zabbixBtn = document.createElement('button');
    zabbixBtn.textContent = '📊 Zabbix';
    zabbixBtn.className = 'copy-button zabbix-btn';
    zabbixBtn.type = 'button';
    zabbixBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.open(`http://10.10.20.30/zabbix.php?action=search&search=${ip}`, '_blank');
    });

    buttonsRow.appendChild(copyIpBtn);
    buttonsRow.appendChild(copyPortBtn);
    buttonsRow.appendChild(telnetBtn);
    buttonsRow.appendChild(zabbixBtn);
    container.appendChild(buttonsRow);

    // Команды
    const commands = generateCommands(ip, port);

    commands.forEach((cmd) => {
        const cmdContainer = document.createElement('div');
        cmdContainer.className = 'command-item';

        const cmdText = document.createElement('code');
        cmdText.textContent = cmd;
        cmdText.className = 'command-text-gray';

        const copyCmdBtn = document.createElement('button');
        copyCmdBtn.textContent = '📋 Копировать';
        copyCmdBtn.className = 'copy-btn';
        copyCmdBtn.type = 'button';

        copyCmdBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();

            const originalText = copyCmdBtn.textContent;
            const success = await copyToClipboard(cmd, copyCmdBtn);

            if (success) {
                copyCmdBtn.textContent = '✅ Скопировано!';
                setTimeout(() => {
                    copyCmdBtn.textContent = originalText;
                }, 2000);
            } else {
                copyCmdBtn.textContent = '❌ Ошибка';
                setTimeout(() => {
                    copyCmdBtn.textContent = originalText;
                }, 2000);
            }
        });

        cmdContainer.appendChild(cmdText);
        cmdContainer.appendChild(copyCmdBtn);
        container.appendChild(cmdContainer);
    });

    return container;
}

function processTextarea(textarea) {
    console.log('[Userside Improver] Обработка textarea');

    const existingContainer = textarea.parentElement.querySelector('.telnet-extractor-wrapper');
    if (existingContainer) {
        existingContainer.remove();
    }

    const text = textarea.value;
    if (!text || text.trim() === '') {
        console.log('[Userside Improver] Textarea пуста');
        return;
    }

    console.log('[Userside Improver] Текст для анализа:', text.substring(0, 200));
    const matches = extractIpAndPort(text);
    console.log('[Userside Improver] Найдено совпадений:', matches.length);

    if (matches.length === 0) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'telnet-extractor-wrapper';

    const header = document.createElement('div');
    header.className = 'extractor-header';
    header.append = `🔍 Найдено ${matches.length} совпадений:`;
    wrapper.appendChild(header);

    matches.forEach((match, idx) => {
        const itemContainer = createLinkAndButtons(match.ip, match.port, idx);
        wrapper.appendChild(itemContainer);

        if (idx < matches.length - 1) {
            const separator = document.createElement('hr');
            separator.className = 'separator';
            wrapper.appendChild(separator);
        }
    });

    textarea.parentElement.insertBefore(wrapper, textarea.nextSibling);
    console.log('[Userside Improver] Элементы добавлены на страницу');
}

let debounceTimer;
function observeTextarea(textarea) {
    console.log('[Userside Improver] Начинаем наблюдение за textarea');

    textarea.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            processTextarea(textarea);
        }, 300);
    });

    textarea.addEventListener('change', () => {
        processTextarea(textarea);
    });

    processTextarea(textarea);
}

// ===== Дополнительные функции для карточки абонента =====
function addCustomerCardFeatures() {
    // 1. Кнопка копирования лицевого счёта
    const accountItems = document.querySelectorAll('.item');
    for (const item of accountItems) {
        const leftData = item.querySelector('.left_data');
        if (leftData && leftData.textContent.trim() === 'Лицевой счет:') {
            const accountDiv = item.querySelector('div:not(.left_data)');
            if (accountDiv && !accountDiv.querySelector('.account-copy-btn')) {
                const accountNum = accountDiv.textContent.trim();
                const btn = document.createElement('button');
                btn.textContent = '📋 Лицевой';
                btn.className = 'account-copy-btn';
                btn.type = 'button';
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const success = await copyToClipboard(accountNum, btn);
                    if (success) {
                        btn.textContent = '✅ Скопировано';
                        setTimeout(() => { btn.textContent = '📋 Лицевой'; }, 2000);
                    }
                });
                accountDiv.appendChild(btn);
            }
            break;
        }
    }

    // 2. Ссылка на NetBox для IP
    const ipMacItems = document.querySelectorAll('.table_data .item');
    for (const item of ipMacItems) {
        const divs = item.querySelectorAll('div');
        if (divs.length >= 2) {
            const firstDiv = divs[0];
            const ipMatch = firstDiv.textContent.trim().match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
            const secondDiv = divs[1];
            const macMatch = secondDiv.textContent.trim().match(/([0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2})/);

            if (ipMatch && !firstDiv.querySelector('.ip-netbox-link')) {
                const ip = ipMatch[1];
                const link = document.createElement('a');
                link.href = `http://192.168.4.13/search/?q=${ip}`;
                link.target = '_blank';
                link.textContent = '🔍 NetBox';
                link.className = 'ip-netbox-link';
                link.title = 'Поиск в NetBox';
                firstDiv.appendChild(link);
            }

            if (macMatch && !secondDiv.querySelector('.mac-copy-btn')) {
                const mac = macMatch[1];
                const btn = document.createElement('button');
                btn.textContent = '📋 MAC';
                btn.className = 'mac-copy-btn';
                btn.type = 'button';
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const success = await copyToClipboard(mac, btn);
                    if (success) {
                        btn.textContent = '✅ Скопировано';
                        setTimeout(() => { btn.textContent = '📋 MAC'; }, 2000);
                    }
                });
                secondDiv.appendChild(btn);
            }
        }
    }

    // 3. Кнопки для IP и порта из Точки подключения
    for (const item of accountItems) {
        const leftData = item.querySelector('.left_data');
        if (leftData && leftData.textContent.trim() === 'Точка подключения:') {
            const contentDiv = item.querySelector('div:not(.left_data)');
            if (!contentDiv) break;

            const italicEl = contentDiv.querySelector('i');
            if (!italicEl || contentDiv.querySelector('.equipment-ip-copy')) break;

            const parts = italicEl.textContent.split(/<br\s*\/?>/i);
            let ip = null;

            const newParts = parts.map(part => {
                const ipMatch = part.match(/IP:\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
                if (ipMatch) {
                    ip = ipMatch[1];
                    return `IP: ${ip} <button class="equipment-btn equipment-ip-copy" data-ip="${ip}">📋 IP</button>
                    <button class="equipment-btn equipment-telnet-btn" data-ip="${ip}">🔗 Telnet</button>
                    <button class="equipment-btn equipment-zabbix-btn" data-ip="${ip}">📊 Zabbix</button>`;
                }
                const portMatch = part.match(/порт:\s*(.*)/);
                if (portMatch) {
                    return `порт: ${portMatch[1].trim()} <button class="equipment-btn equipment-port-copy" data-port="${portMatch[1].trim()}">📋 Порт</button>`;
                }
                return part;
            });

            italicEl.textContent = newParts.join('\n');

            italicEl.querySelectorAll('.equipment-ip-copy').forEach(btn => {
                const ipVal = btn.dataset.ip;
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const success = await copyToClipboard(ipVal, btn);
                    if (success) {
                        btn.textContent = '✅ Скопировано';
                        setTimeout(() => { btn.textContent = '📋 ' + ipVal; }, 2000);
                    }
                });
            });

            italicEl.querySelectorAll('.equipment-port-copy').forEach(btn => {
                const portVal = btn.dataset.port;
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const success = await copyToClipboard(portVal, btn);
                    if (success) {
                        btn.textContent = '✅ Скопировано';
                        setTimeout(() => { btn.textContent = '📋 Порт'; }, 2000);
                    }
                });
            });

            italicEl.querySelectorAll('.equipment-telnet-btn').forEach(btn => {
                const ipVal = btn.dataset.ip;
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = (`telnet://${ipVal}`);
                });
            });

            italicEl.querySelectorAll('.equipment-zabbix-btn').forEach(btn => {
                const ipVal = btn.dataset.ip;
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(`http://10.10.20.30/zabbix.php?action=search&search=${ipVal}`, '_blank');
                });
            });

            break;
        }
    }
}

function init() {
    console.log('[Userside Improver] Инициализация...');

    // Поиск телефона в таблице и добавление кнопки
    findAndAddPhoneButton();

    // Создание кнопки вставки из буфера
    setInterval(() => {
        const opisTextarea = document.querySelector('textarea[name="opis"]');
        const commentTextarea = document.querySelector('textarea[name="comment"]');
        if (opisTextarea) {
            console.log('[Userside Improver] Textarea opis найдена для кнопок');  
            createPasteButton(opisTextarea);
            return;
        } else if (commentTextarea) {
            console.log('[Userside Improver] Textarea comment найдена для кнопок');
            createPasteButton(commentTextarea);
            return;
        } else {
            console.log('[Userside Improver] Не найдена Textarea opis и comment')
            return;
        }
    }, 1000);

    // Дополнительные функции для карточки абонента
    setTimeout(() => {
        addCustomerCardFeatures();
    }, 1000);

    const allTextareas = findAllTextareas();

    if (allTextareas.length === 0) {
        console.log('[Userside Improver] На странице нет textarea');
        showNotification('⚠️ [Userside Improver]: На странице не найдено полей ввода (textarea)', '#ff9800');
        return;
    }

    allTextareas.forEach((textarea, index) => {
        console.log(`[Userside Improver] Установка обработчика для textarea ${index + 1}`);
        observeTextarea(textarea);
    });

    showNotification(`✅ [Userside Improver] активен (найдено ${allTextareas.length} textarea)`, '#4CAF50');
}

// Вспомогательная функция для уведомлений
function showNotification(message, bgColor) {
    const notification = document.createElement('div');
    notification.append = message;
    notification.style.cssText = `position:fixed; bottom:10px; right:10px; background:${bgColor}; color:white; padding:8px 12px; border-radius:5px; z-index:10000; font-size:12px; font-family:monospace;`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

const observer = new MutationObserver(() => {
    const textareas = document.querySelectorAll('textarea');
    if (textareas.length > 0) {
        textareas.forEach(textarea => {
            if (!textarea.hasAttribute('data-telnet-extractor-attached')) {
                textarea.setAttribute('data-telnet-extractor-attached', 'true');
                console.log('[Userside Improver] Найдена новая textarea');
                observeTextarea(textarea);
            }
        });
    }
});

observer.observe(document.body, { childList: true, subtree: true });