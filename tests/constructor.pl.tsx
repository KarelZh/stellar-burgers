import { test, expect, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiHar = path.join(__dirname, 'hars', 'backend.har');

const constructorName = 'Краторная булка N-200i';
const fillingName = 'Биокотлета из марсианской Магнолии';
const orderNumber = 12345;
const constructorId = '643d69a5c3f7b9001cfa0941';
const filingId = '643d69a5c3f7b9001cfa0945';

const addIngredients = async (page: Page, name: string): Promise<void> => {
    const ingredientCard = page.getByRole('listitem').filter({ hasText: name });
    await ingredientCard.getByRole('button', { name: 'Добавить' }).click();
};

const openConstructor = async (page: Page): Promise<void> => {
    await page.routeFromHAR(apiHar, {
        url: '**/api/**',
    });

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Соберите бургер' })).toBeVisible();
    await expect(page.getByText(constructorName)).toBeVisible();
};

const getConstructor = (page: Page) =>
    page.locator('section').filter({
        has: page.getByRole('button', { name: 'Оформить заказ' }),
    });

const openIngredientModal = async (page: Page): Promise<void> => {
    const ingredientsModal = page.getByRole('dialog');

    await expect(ingredientsModal).toHaveCount(0);

    await page.getByRole('link').filter({ hasText: constructorName }).click();

    await expect(ingredientsModal).toBeVisible();
    await expect(ingredientsModal.getByText(constructorName)).toBeVisible();
};

const authorizeUser = async (page: Page): Promise<void> => {
    await page.context().addCookies([
        {
            name: 'accessToken',
            value: 'Bearer test-access-token',
            domain: 'localhost',
            path: '/',
            httpOnly: false,
            secure: false,
            sameSite: 'Lax',
        },
    ]);

    await page.addInitScript(() => {
        window.localStorage.setItem('refreshToken', 'test-refresh-token');
    });
};

test.beforeEach(async ({ page }) => {
    await openConstructor(page);
});

test.describe('добавление ингредиентов в конструктор', () => {
    test('добавление булок в конструктор', async ({ page }) => {
        const constructor = getConstructor(page);

        await expect(constructor.getByText(constructorName)).toHaveCount(0);

        await addIngredients(page, constructorName);

        await expect(constructor.getByText(`${constructorName} (верх)`)).toBeVisible();
        await expect(constructor.getByText(`${constructorName} (низ)`)).toBeVisible();
    });

    test('добавление булки и начинки одновременно', async ({ page }) => {
        const constructor = getConstructor(page);

        await expect(constructor.getByText(constructorName)).toHaveCount(0);
        await expect(constructor.getByText(fillingName)).toHaveCount(0);

        await addIngredients(page, constructorName);

        await expect(constructor.getByText(`${constructorName} (верх)`)).toBeVisible();
        await expect(constructor.getByText(`${constructorName} (низ)`)).toBeVisible();

        await addIngredients(page, fillingName);

        await expect(constructor.getByText(fillingName)).toBeVisible();
    });
});

test.describe('модальное окно ингредиента', () => {
    test('открытие модального окна ингредиента', async ({ page }) => {
        await openIngredientModal(page);

        const ingredientsModal = page.getByRole('dialog');
        await expect(ingredientsModal.getByRole('heading', { name: 'Детали ингредиента' })).toBeVisible();
        await expect(ingredientsModal.getByText(constructorName)).toBeVisible();
        await expect(ingredientsModal.getByText('Калории, ккал')).toBeVisible();
    });

    test('закрытие модального окна по крестику', async ({ page }) => {
        await openIngredientModal(page);

        const ingredientsModal = page.getByRole('dialog');

        await ingredientsModal.getByRole('button', { name: 'Закрыть' }).click();

        await expect(ingredientsModal).toBeHidden();
        await expect(page).toHaveURL('/');
    });

    test('закрытие модального окна по оверлею', async ({ page }) => {
        await openIngredientModal(page);

        const ingredientsModal = page.getByRole('dialog');

        await page.getByTestId('modal-overlay').click({
            position: { x: 5, y: 5 },
        });

        await expect(ingredientsModal).toBeHidden();
        await expect(page).toHaveURL('/');
    });
});

test.describe('оформление заказа', () => {
    test('создание заказа, очистка конструктора, закрытие окна заказа', async ({ page }) => {
        await authorizeUser(page);
        await page.goto('/');

        let requestBody: { ingredients: string[] } | undefined;
        let authorizationHeader: string | undefined;

        page.on('request', (request) => {
            if (request.url().endsWith('/api/orders') && request.method() === 'POST') {
                requestBody = request.postDataJSON() as { ingredients: string[] };
                authorizationHeader = request.headers().authorization;
            }
        });

        await expect(page.getByText('Test User')).toBeVisible();

        const constructor = getConstructor(page);

        await expect(constructor.getByText(constructorName)).toHaveCount(0);
        await expect(constructor.getByText(fillingName)).toHaveCount(0);

        await addIngredients(page, constructorName);
        await addIngredients(page, fillingName);

        await expect(constructor.getByText(`${constructorName} (верх)`)).toBeVisible();
        await expect(constructor.getByText(`${constructorName} (низ)`)).toBeVisible();
        await expect(constructor.getByText(fillingName)).toBeVisible();

        const orderModal = page.getByRole('dialog');
        await expect(orderModal).toHaveCount(0);

        await page.getByRole('button', { name: 'Оформить заказ' }).click();

        await expect(orderModal).toBeVisible();
        await expect(orderModal.getByText(String(orderNumber))).toBeVisible();
        await expect(orderModal.getByText('идентификатор заказа')).toBeVisible();
        await expect(orderModal.getByText('ваш заказ начали готовить')).toBeVisible();

        expect(requestBody?.ingredients).toEqual([constructorId, filingId, constructorId]);
        expect(authorizationHeader).toBe('Bearer test-access-token');

        await expect(constructor.getByText('Выберите булки')).toHaveCount(2);
        await expect(constructor.getByText('Выберите начинку')).toBeVisible();

        await orderModal.getByRole('button', { name: 'Закрыть' }).click();

        await expect(orderModal).toBeHidden();
    });
});




