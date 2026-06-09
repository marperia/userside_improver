// ===== TELNET EXTRACTOR - С КНОПКОЙ ТЕЛЕФОНА =====
console.log('[TelnetExtractor] Скрипт загружен');

// ===== Функция для вставки текста из буфера обмена в textarea opis =====
async function pasteFromClipboardToOpis() {
    console.log('[TelnetExtractor] Вставка из буфера обмена в textarea opis...');

    // Находим textarea с name="opis"
    const opisTextarea = document.querySelector('textarea[name="opis"]');

    if (!opisTextarea) {
        console.log('[TelnetExtractor] Textarea с name="opis" не найдена');
        showNotification('⚠️ Textarea "opis" не найдена на странице', '#ff9800');
        return;
    }

    try {
        // Читаем текст из буфера обмена
        const clipboardText = await navigator.clipboard.readText();
        console.log('[TelnetExtractor] Текст из буфера:', clipboardText);

        // Получаем текущий текст из textarea
        const currentText = opisTextarea.value;

        // Формируем новый текст: текст кнопки + текст из буфера
        const buttonText = '[Добавлено расширением] ';
        const newText = currentText + buttonText + clipboardText + '\n';

        // Вставляем в textarea
        opisTextarea.value = newText;

        // Триггерим событие input, чтобы расширение обработало новые данные
        const event = new Event('input', { bubbles: true });
        opisTextarea.dispatchEvent(event);

        console.log('[TelnetExtractor] Текст успешно вставлен');

        // Показываем уведомление об успехе
        showNotification('✅ Текст из буфера вставлен в поле "opis"', '#4CAF50');

    } catch (err) {
        console.error('[TelnetExtractor] Ошибка при вставке из буфера:', err);

        let errorMessage = 'Не удалось вставить текст. ';
        if (err.name === 'NotAllowedError') {
            errorMessage += 'Разрешите доступ к буферу обмена.';
        } else if (err.name === 'ReadError') {
            errorMessage += 'Не удалось прочитать буфер обмена.';
        } else {
            errorMessage += 'Ошибка: ' + err.message;
        }

        showNotification('❌ ' + errorMessage, '#d83c30');
    }
}

// Функция для создания кнопки вставки из буфера
function createPasteButton() {
    // Проверяем, есть ли уже такая кнопка
    if (document.querySelector('.paste-from-clipboard-btn')) {
        return;
    }

    // Находим textarea opis
    const opisTextarea = document.querySelector('textarea[name="opis"]');
    if (!opisTextarea) {
        console.log('[TelnetExtractor] Textarea opis не найдена для кнопки');
        return;
    }

    // Создаем контейнер для кнопки
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'paste-button-container';
    buttonContainer.style.marginTop = '10px';
    buttonContainer.style.marginBottom = '10px';

    // Создаем кнопку
    const pasteButton = document.createElement('button');
    pasteButton.textContent = '📋 Вставить из буфера в opis';
    pasteButton.className = 'paste-from-clipboard-btn';
    pasteButton.type = 'button';

    pasteButton.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await pasteFromClipboardToOpis();
    });

    buttonContainer.appendChild(pasteButton);

    // Вставляем кнопку перед textarea opis
    opisTextarea.parentElement.insertBefore(buttonContainer, opisTextarea);
    console.log('[TelnetExtractor] Кнопка вставки из буфера добавлена');
}

// ===== Функция для поиска и добавления кнопки телефона в таблицу =====
function findAndAddPhoneButton() {
    console.log('[TelnetExtractor] Поиск телефона...');

    // Ищем все строки таблицы
    const rows = document.querySelectorAll('tr');

    for (let row of rows) {
        // Получаем все дочерние ячейки строки
        const cells = row.children;

        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];

            // Ищем левую ячейку с текстом
            if (cell.textContent.includes('Дополнительные контакты для связи:')) {
                console.log('[TelnetExtractor] Найдена строка с контактами');

                // Берем следующую ячейку (правую) по индексу
                const phoneCell = cells[i + 1];

                if (phoneCell) {
                    const phoneText = phoneCell.textContent.trim();
                    console.log('[TelnetExtractor] Найден номер телефона:', phoneText);

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
                        console.log('[TelnetExtractor] Кнопка телефона добавлена, номер:', formattedPhone);
                    }
                }
                break;
            }
        }
    }
}

function findAllTextareas() {
    const allTextareas = document.querySelectorAll('textarea');
    console.log('[TelnetExtractor] Найдено textarea на странице:', allTextareas.length);

    allTextareas.forEach((ta, idx) => {
        console.log(`[TelnetExtractor] Textarea ${idx + 1}:`, {
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
    console.log('[TelnetExtractor] Попытка скопировать:', text);

    // Способ 1: Современный Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            console.log('[TelnetExtractor] Скопировано через Clipboard API');
            return true;
        } catch (err) {
            console.error('[TelnetExtractor] Clipboard API ошибка:', err);
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
            console.log('[TelnetExtractor] Скопировано через execCommand');
            return true;
        }
    } catch (err) {
        console.error('[TelnetExtractor] execCommand ошибка:', err);
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
    pairInfo.innerHTML = `<strong>${ip}</strong> → ${port}`;
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
    telnetBtn.className = 'copy-button';
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
    console.log('[TelnetExtractor] Обработка textarea');

    const existingContainer = textarea.parentElement.querySelector('.telnet-extractor-wrapper');
    if (existingContainer) {
        existingContainer.remove();
    }

    const text = textarea.value;
    if (!text || text.trim() === '') {
        console.log('[TelnetExtractor] Textarea пуста');
        return;
    }

    console.log('[TelnetExtractor] Текст для анализа:', text.substring(0, 200));
    const matches = extractIpAndPort(text);
    console.log('[TelnetExtractor] Найдено совпадений:', matches.length);

    if (matches.length === 0) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'telnet-extractor-wrapper';

    const header = document.createElement('div');
    header.className = 'extractor-header';
    header.innerHTML = `🔍 Найдено ${matches.length} совпадений:`;
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
    console.log('[TelnetExtractor] Элементы добавлены на страницу');
}

let debounceTimer;
function observeTextarea(textarea) {
    console.log('[TelnetExtractor] Начинаем наблюдение за textarea');

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

function init() {
    console.log('[TelnetExtractor] Инициализация...');

    // Поиск телефона в таблице и добавление кнопки
    findAndAddPhoneButton();

    // Создание кнопки вставки из буфера
    setInterval(() => {
        createPasteButton();
    }, 500);

    const allTextareas = findAllTextareas();

    if (allTextareas.length === 0) {
        console.log('[TelnetExtractor] На странице нет textarea');
        showNotification('⚠️ Telnet Extractor: На странице не найдено полей ввода (textarea)', '#ff9800');
        return;
    }

    allTextareas.forEach((textarea, index) => {
        console.log(`[TelnetExtractor] Установка обработчика для textarea ${index + 1}`);
        observeTextarea(textarea);
    });

    showNotification(`✅ Telnet Extractor активен (найдено ${allTextareas.length} textarea)`, '#4CAF50');
}

// Вспомогательная функция для уведомлений
function showNotification(message, bgColor) {
    const notification = document.createElement('div');
    notification.innerHTML = message;
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
                console.log('[TelnetExtractor] Найдена новая textarea');
                observeTextarea(textarea);
            }
        });
    }
});

observer.observe(document.body, { childList: true, subtree: true });