import ingredientsReducer, { fetchIngredients } from './ingredientsSlice';

import type { TIngredientsState } from './ingredientsSlice';
import type { TIngredient } from '@/utils/types';

const initialState: TIngredientsState = {
  ingredients: [],
  isLoading: false,
  error: null,
};

const mockIngredients: TIngredient[] = [
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: '',
    image_mobile: '',
    image_large: '',
  },
  {
    _id: '643d69a5c3f7b9001cfa0941',
    name: 'Биокотлета из марсианской Магмы',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 324,
    image: '',
    image_mobile: '',
    image_large: '',
  },
];

const stateWithError = {
  ingredients: mockIngredients,
  isLoading: false,
  error: 'Что-то пошло не так',
};

describe('ingredientsSlice', () => {
  describe('неизвестный экшен', () => {
    it('при передаче undefined в качестве состояния возвращает initialState', () => {
      const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });

      expect(state).toEqual(initialState);
    });

    it('не изменяет существующее состояние', () => {
      const state = ingredientsReducer(stateWithError, { type: 'UNKNOWN' });

      expect(state).toEqual(stateWithError);
    });
  });

  describe('fetchIngredients.pending', () => {
    it('ставит isLoading в true и сбрасывает ошибку', () => {
      const action = { type: fetchIngredients.pending.type };
      const state = ingredientsReducer(stateWithError, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
      // данные не трогаем
      expect(state.ingredients).toEqual(stateWithError.ingredients);
    });
  });

  describe('fetchIngredients.fulfilled', () => {
    it('записывает полученные ингредиенты и снимает isLoading', () => {
      const action = {
        type: fetchIngredients.fulfilled.type,
        payload: mockIngredients,
      };
      const state = ingredientsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.ingredients).toEqual(mockIngredients);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchIngredients.rejected', () => {
    it('записывает сообщение об ошибке из экшена', () => {
      const action = {
        type: fetchIngredients.rejected.type,
        error: { message: 'Ошибка сети' },
      };
      const state = ingredientsReducer(stateWithError, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Ошибка сети');
    });

    it('использует дефолтное сообщение, если error.message нет', () => {
      const action = {
        type: fetchIngredients.rejected.type,
        error: {},
      };
      const state = ingredientsReducer(initialState, action);

      expect(state.error).toBe('Не удалось загрузить ингредиенты');
    });
  });
});
