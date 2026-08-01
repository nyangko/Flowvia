<div align="center">

<img src="../assets/banner.png" alt="Flowvia - Инструмент для изометрических диаграмм" width="100%" />

</div>

<p align="center">
 <a href="../README.md">English</a> | <a href="README.cn.md">简体中文</a> | <a href="README.es.md">Español</a> | <a href="README.pt.md">Português</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.bn.md">বাংলা</a> | <a href="README.ru.md">Русский</a> | <a href="README.id.md">Bahasa Indonesia</a> | <a href="README.de.md">Deutsch</a> | <a href="README.ko.md">한국어</a> | <a href="README.ja.md">日本語</a>
</p>

## Примечание:

Этот репозиторий (Flowvia) является производным от [Abrar74774/FossFLOW](https://github.com/Abrar74774/FossFLOW), который сам является форком stan-smith/FossFLOW (который, в свою очередь, был форком [markmanx/isoflow](https://github.com/markmanx/isoflow)), изначально созданным с целью внесения вклада в оригинальный репозиторий через PR. Однако имя пользователя GitHub автора, похоже, изменилось на [mug-book-droid](https://github.com/mug-book-droid), а его активность стала приватной (возможно, аккаунт заблокирован?), из-за чего оригинальный репозиторий стал недоступен.

На данный момент я намерен сделать этот репозиторий (теперь названный Flowvia) продолжением разработки FossFLOW, и любой вклад через PR также приветствуется.

Вы можете ознакомиться с последним состоянием оригинального репозитория, которое я получил, в ветке `backup/stan-smith-FossFLOW`.

---

Flowvia - это мощное прогрессивное веб-приложение (PWA) с открытым исходным кодом для создания красивых изометрических диаграмм. Создано с помощью React и библиотеки <a href="https://github.com/markmanx/isoflow">Isoflow</a> (форкнута и опубликована на npm как fossflow, а в этом форке как flowvia), оно полностью работает в вашем браузере с поддержкой офлайн-режима.

---
<p align="center">
<b>Попробуйте онлайн --> https://nyangko.github.io/Flowvia/ <-- </b>
</p>

<img width="100%" alt="Flowvia-Isometric-Diagramming-Tool" src="https://github.com/user-attachments/assets/15956888-991a-4b5e-9849-dbd82d6f9308" />

---------

## 🐳 Быстрое развертывание с Docker

```bash
# Использование Docker Compose (рекомендуется - включает постоянное хранилище)
docker compose up

# Или запустите напрямую из Docker Hub с постоянным хранилищем
docker run -p 80:80 -v $(pwd)/diagrams:/data/diagrams nyangko/flowvia:latest
```

Хранилище сервера включено по умолчанию в Docker. Ваши диаграммы будут сохранены (по умолчанию от имени root) в `./diagrams` на хосте. Чтобы изменить пользователя или ID группы, используемые при сохранении, установите переменные окружения `PUID` и `PGID`.

Чтобы отключить хранилище сервера, установите `ENABLE_SERVER_STORAGE=false`:
```bash
docker run -p 80:80 -e ENABLE_SERVER_STORAGE=false nyangko/flowvia:latest
```

### HTTP Базовая Аутентификация (Опционально)

Защитите ваш экземпляр Flowvia с помощью HTTP Basic Auth:

```bash
# С Docker Compose
HTTP_AUTH_USER=admin HTTP_AUTH_PASSWORD=secret docker compose up

# Или с docker run
docker run -p 80:80 \
  -e HTTP_AUTH_USER=admin \
  -e HTTP_AUTH_PASSWORD=secret \
  nyangko/flowvia:latest
```

> **Примечание**: Обе переменные должны быть установлены для включения аутентификации. Если любая из них пуста, приложение доступно без входа в систему.

## Быстрый старт (Локальная разработка)

```bash
# Клонировать репозиторий
git clone https://github.com/nyangko/Flowvia
cd Flowvia

# Установить зависимости
npm install

# Собрать библиотеку (требуется в первый раз)
npm run build:lib

# Запустить сервер разработки
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в вашем браузере.

## Структура Monorepo

Это monorepo, содержащий два пакета:

- `packages/flowvia-lib` - Библиотека компонентов React для рисования сетевых диаграмм (собрана с Webpack)
- `packages/flowvia-app` - Прогрессивное веб-приложение, которое оборачивает и представляет библиотеку (собрано с RSBuild)

### Команды разработки

```bash
# Разработка
npm run dev          # Запустить сервер разработки приложения
npm run dev:lib      # Режим наблюдения для разработки библиотеки

# Сборка
npm run build        # Собрать библиотеку и приложение
npm run build:lib    # Собрать только библиотеку
npm run build:app    # Собрать только приложение

# Тестирование и линтинг
npm test             # Запустить модульные тесты
npm run lint         # Проверить ошибки линтинга

# E2E тесты (Selenium)
cd e2e-tests
./run-tests.sh       # Запустить сквозные тесты (требуется Docker и Python)

# Публикация
npm run publish:lib  # Опубликовать библиотеку в npm
```

## Как использовать

### Создание диаграмм

1. **Добавить элементы**:
   - Нажмите кнопку "+" в правом верхнем меню, библиотека компонентов появится слева
   - Перетащите компоненты из библиотеки на холст
   - Или щелкните правой кнопкой мыши на сетке и выберите "Добавить узел"

2. **Соединить элементы**:
   - Выберите инструмент Соединитель (нажмите 'C' или щелкните значок соединителя)
   - **Режим клика** (по умолчанию): Щелкните первый узел, затем щелкните второй узел
   - **Режим перетаскивания** (опционально): Щелкните и перетащите от первого узла ко второму
   - Переключайте режимы в Настройки → вкладка Соединители

3. **Сохранить вашу работу**:
   - **Быстрое сохранение** - Сохраняет в сеанс браузера
   - **Экспорт** - Скачать как JSON файл
   - **Импорт** - Загрузить из JSON файла

### Варианты хранения

- **Хранилище сеанса**: Временные сохранения удаляются при закрытии браузера
- **Экспорт/Импорт**: Постоянное хранилище в виде JSON файлов
- **Автосохранение**: Автоматически сохраняет изменения каждые 5 секунд в сеанс

## Недавно добавлено

### Мультиплексирование соединителей
<img src="demos/connectors.gif" alt="Multiplexed connectors demo" />

### Копирование и вставка элементов
<img src="demos/copy-paste-demo.gif" alt="Copy pasting demo" />

## Внесение вклада

Мы приветствуем вклад! Пожалуйста, смотрите [CONTRIBUTING.md](../CONTRIBUTING.md) для руководства.

## Документация

- [FLOWVIA_ENCYCLOPEDIA.md](FLOWVIA_ENCYCLOPEDIA.md) - Всестороннее руководство по кодовой базе
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Руководство по внесению вклада

## Лицензия

MIT
