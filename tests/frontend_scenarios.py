"""Browser checks for lab 3. Start npm run preview before running this file."""
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE_URL = os.environ.get('BASE_URL', 'http://localhost:4173')
ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / 'docs/screenshots/lab3'
SAVE_SCREENSHOTS = os.environ.get('SCREENSHOTS') == '1'


def screenshot(page, name):
    if SAVE_SCREENSHOTS:
        SHOTS.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(SHOTS / f'{name}.png'), full_page=True, animations='disabled')


def choose(page, label, option):
    page.get_by_role('combobox', name=label).click()
    page.get_by_role('option', name=option, exact=True).click()


def navigate(page, name):
    page.get_by_role('navigation').get_by_role('link', name=name, exact=True).click()


def desktop_rows(page):
    return page.locator('.desktop-measurements tbody tr')


def run():
    with sync_playwright() as playwright:
        launch = {'headless': True}
        if os.environ.get('CHROMIUM_PATH'):
            launch['executable_path'] = os.environ['CHROMIUM_PATH']
        browser = playwright.chromium.launch(**launch)
        context = browser.new_context(viewport={'width': 1440, 'height': 1080}, timezone_id='Europe/Moscow')
        page = context.new_page()
        page.clock.set_fixed_time(datetime(2026, 11, 9, 9, 0, tzinfo=timezone.utc))
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(BASE_URL)
        expect(page.get_by_role('heading', name='Обзор показателей')).to_be_visible()
        page.keyboard.press('Tab')
        expect(page.get_by_role('link', name='К содержимому')).to_be_focused()
        page.keyboard.press('Enter')
        expect(page.locator('main')).to_be_focused()
        screenshot(page, 'home-desktop')
        navigate(page, 'История')
        expect(desktop_rows(page)).to_have_count(10)
        screenshot(page, 'history-desktop')
        choose(page, 'Тип показателя', 'Пульс')
        expect(desktop_rows(page)).to_have_count(2)
        page.get_by_role('textbox', name='Поиск по заметке').fill('  УТРЕННЕЕ ')
        expect(desktop_rows(page)).to_have_count(1)
        page.get_by_role('textbox', name='Поиск по заметке').fill('несуществующая заметка')
        expect(page.get_by_text('По вашему запросу ничего не найдено')).to_be_visible()
        screenshot(page, 'empty-search')
        page.get_by_role('button', name='Сбросить', exact=True).click()
        expect(desktop_rows(page)).to_have_count(10)
        before = desktop_rows(page).first.inner_text()
        choose(page, 'Порядок записей', 'Сначала старые')
        assert desktop_rows(page).last.inner_text() == before
        page.get_by_role('button', name='Сбросить', exact=True).click()
        print('PASS: combined filter, case-insensitive search, empty result, reset, sorting', flush=True)

        # All types, including decimal comma, then invalid input and keyboard submit.
        types = [('Пульс', '73'), ('Давление', None), ('Температура', '36,7'), ('Сахар крови', '5.2'), ('Вес', '69,1')]
        for index, (kind, value) in enumerate(types):
            navigate(page, 'Добавить измерение')
            if index == 0:
                screenshot(page, 'new-measurement-desktop')
                page.get_by_role('button', name='Сохранить', exact=True).click()
                expect(page.get_by_text('Введите значение.', exact=True)).to_be_visible()
                expect(page.locator('input[name=value]')).to_be_focused()
                for invalid in ['0', '-1', 'abc', '72.5']:
                    page.locator('input[name=value]').fill(invalid)
                    page.get_by_role('button', name='Сохранить', exact=True).click()
                    expect(page).to_have_url(BASE_URL + '/measurements/new')
                page.locator('input[name=value]').fill('72')
                page.locator('input[name=measuredAt]').fill('')
                page.get_by_role('button', name='Сохранить', exact=True).click()
                expect(page.get_by_text('Укажите корректные дату и время.')).to_be_visible()
                page.locator('input[name=measuredAt]').fill('2026-11-09T12:00')
                screenshot(page, 'validation-error')
            choose(page, 'Тип показателя', kind)
            if value is None:
                page.locator('input[name=systolic]').fill('121')
                page.locator('input[name=diastolic]').fill('81')
                screenshot(page, 'new-pressure-desktop')
            else:
                page.locator('input[name=value]').fill(value)
            page.get_by_role('textbox', name='Заметка к измерению').fill(f'Тест {kind}')
            page.get_by_role('button', name='Сохранить', exact=True).focus()
            page.keyboard.press('Enter')
            expect(desktop_rows(page)).to_have_count(11 + index)
            expect(page.get_by_role('alert')).to_contain_text('Измерение сохранено')
        navigate(page, 'Главная')
        expect(page.get_by_role('article', name='Последнее измерение: Температура')).to_contain_text('36,7')
        print('PASS: all five types, validation, focus, keyboard submit, latest card', flush=True)

        # Editing reuses the form and replaces fields instead of merging stale pressure values.
        navigate(page, 'История')
        row = desktop_rows(page).filter(has_text='Тест Давление')
        row.get_by_role('link', name='Изменить').click()
        expect(page.locator('input[name=systolic]')).to_have_value('121')
        screenshot(page, 'edit-desktop')
        edit_url = page.url
        choose(page, 'Тип показателя', 'Вес')
        expect(page.locator('input[name=value]')).to_have_value('')
        expect(page.locator('input[name=systolic]')).to_have_count(0)
        page.locator('input[name=value]').fill('70,5')
        page.get_by_role('textbox', name='Заметка к измерению').fill('Изменённая запись')
        page.get_by_role('button', name='Сохранить изменения').click()
        expect(desktop_rows(page)).to_have_count(15)
        row = desktop_rows(page).filter(has_text='Изменённая запись')
        expect(row).to_contain_text('70,5')
        assert row.get_by_role('link', name='Изменить').get_attribute('href') == edit_url.removeprefix(BASE_URL)
        row.get_by_role('link', name='Изменить').click()
        page.locator('input[name=value]').fill('99')
        page.get_by_role('link', name='Отмена', exact=True).click()
        expect(desktop_rows(page).filter(has_text='Изменённая запись')).to_contain_text('70,5')
        print('PASS: edit pressure to weight, ID preserved, cancel edit', flush=True)

        # Delete: cancel, Escape, confirm; latest card must use the remaining record.
        row = desktop_rows(page).filter(has_text='Тест Температура')
        row.get_by_role('button', name='Удалить', exact=True).click()
        dialog = page.get_by_role('dialog')
        expect(dialog).to_contain_text('36,7')
        screenshot(page, 'delete-confirmation')
        dialog.get_by_role('button', name='Отмена').click()
        expect(desktop_rows(page)).to_have_count(15)
        row.get_by_role('button', name='Удалить', exact=True).click()
        page.keyboard.press('Escape')
        expect(dialog).not_to_be_visible()
        row.get_by_role('button', name='Удалить', exact=True).click()
        dialog.get_by_role('button', name='Удалить', exact=True).click()
        expect(desktop_rows(page)).to_have_count(14)
        navigate(page, 'Главная')
        expect(page.get_by_role('article', name='Последнее измерение: Температура')).to_contain_text('36,6')
        # An older measurement must not replace the latest one.
        navigate(page, 'Добавить измерение')
        page.locator('input[name=value]').fill('89')
        page.locator('input[name=measuredAt]').fill('2020-01-01T09:00')
        page.get_by_role('button', name='Сохранить', exact=True).click()
        navigate(page, 'Главная')
        expect(page.get_by_role('article', name='Последнее измерение: Пульс')).to_contain_text('73')
        page.reload()
        navigate(page, 'История')
        expect(desktop_rows(page)).to_have_count(10)
        print('PASS: cancel/confirm delete, latest fallback, old date, reload reset', flush=True)

        # Direct URLs, responsive layout and reduced motion.
        for path in ['/measurements', '/measurements/new', '/measurements/demo-1/edit']:
            page.goto(BASE_URL + path)
            expect(page.locator('h1')).to_be_visible()
        page.goto(BASE_URL + '/measurements/missing/edit')
        expect(page.get_by_role('alert')).to_contain_text('Измерение не найдено')
        screenshot(page, 'missing-measurement')
        page.goto(BASE_URL + '/unknown')
        expect(page.get_by_role('heading', name='Страница не найдена')).to_be_visible()
        for width in [320, 390, 768, 1024]:
            page.set_viewport_size({'width': width, 'height': 844})
            for path in ['/', '/measurements', '/measurements/new', '/measurements/demo-2/edit']:
                page.goto(BASE_URL + path)
                expect(page.locator('h1')).to_be_visible()
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, path)
                if width == 390:
                    screenshot(page, {'/':'home-mobile','/measurements':'history-mobile','/measurements/new':'new-mobile','/measurements/demo-2/edit':'edit-mobile'}[path])
        page.set_viewport_size({'width':390,'height':844})
        page.goto(BASE_URL + '/measurements/new')
        choose(page, 'Тип показателя', 'Давление')
        page.locator('input[name=systolic]').fill('119')
        page.locator('input[name=diastolic]').fill('79')
        page.get_by_role('textbox', name='Заметка к измерению').fill('Мобильная запись')
        page.get_by_role('button', name='Сохранить', exact=True).click()
        card = page.locator('.mobile-record').filter(has_text='Мобильная запись')
        expect(card).to_contain_text('119/79')
        card.get_by_role('link', name='Изменить').click()
        page.locator('input[name=systolic]').fill('118')
        page.get_by_role('button', name='Сохранить изменения').click()
        expect(page.locator('.mobile-record').filter(has_text='Мобильная запись')).to_contain_text('118/79')
        page.locator('.mobile-record').filter(has_text='Мобильная запись').get_by_role('button', name='Удалить').click()
        page.get_by_role('dialog').get_by_role('button', name='Удалить', exact=True).click()
        expect(page.locator('.mobile-record').filter(has_text='Мобильная запись')).to_have_count(0)
        print('PASS: mobile pressure create/edit/delete', flush=True)
        page.emulate_media(reduced_motion='reduce')
        page.goto(BASE_URL + '/measurements')
        expect(page.locator('.page-content')).to_be_visible()
        assert page.locator('.page-content').evaluate('(node) => getComputedStyle(node).animationName') == 'none'
        page.emulate_media(reduced_motion='no-preference')
        assert not errors, errors
        print('PASS: direct routes, missing ID, 404, widths 320–1024, reduced motion, no JS errors', flush=True)

        # Network failures are intercepted only by the test, not by a hidden UI switch.
        page.set_viewport_size({'width':1440,'height':1080})
        page.route('**/demo/measurements.json', lambda route: route.fulfill(status=500, body='error'))
        page.goto(BASE_URL)
        expect(page.get_by_role('heading', name='Журнал пока недоступен')).to_be_visible()
        screenshot(page, 'load-error')
        page.unroute('**/demo/measurements.json')
        page.get_by_role('button', name='Повторить загрузку').click()
        expect(page.get_by_role('heading', name='Обзор показателей')).to_be_visible()
        for body in ['not json', json.dumps([{'id':'broken'}])]:
            page.route('**/demo/measurements.json', lambda route: route.fulfill(content_type='application/json', body=body))
            page.goto(BASE_URL)
            expect(page.get_by_role('heading', name='Журнал пока недоступен')).to_be_visible()
            page.unroute('**/demo/measurements.json')
        page.route('**/demo/measurements.json', lambda route: route.fulfill(content_type='application/json', body='[]'))
        page.goto(BASE_URL + '/measurements')
        expect(page.get_by_role('heading', name='Пока нет измерений')).to_be_visible()
        screenshot(page, 'empty-journal')
        navigate(page, 'Главная')
        expect(page.get_by_text('Пока нет записей', exact=True)).to_have_count(5)
        navigate(page, 'Добавить измерение')
        page.locator('input[name=value]').fill('75')
        page.get_by_role('button', name='Сохранить', exact=True).click()
        expect(desktop_rows(page)).to_have_count(1)
        desktop_rows(page).first.get_by_role('button', name='Удалить', exact=True).click()
        page.get_by_role('dialog').get_by_role('button', name='Удалить', exact=True).click()
        expect(page.get_by_role('heading', name='Пока нет измерений')).to_be_visible()
        page.unroute('**/demo/measurements.json')
        print('PASS: HTTP error/retry, invalid JSON, invalid record, empty journal, last deletion', flush=True)

        # Hold the request to observe loading, then release it.
        pending = []
        page.route('**/demo/measurements.json', lambda route: pending.append(route))
        page.goto(BASE_URL, wait_until='domcontentloaded')
        expect(page.get_by_role('heading', name='Загружаем измерения…')).to_be_visible()
        screenshot(page, 'loading')
        for route in pending:
            route.fulfill(content_type='application/json', body=(ROOT/'public/demo/measurements.json').read_text())
        expect(page.get_by_role('heading', name='Обзор показателей')).to_be_visible()
        assert not errors, errors
        print('PASS: loading followed by ready; all browser scenarios passed', flush=True)
        browser.close()


if __name__ == '__main__':
    run()
