import burgerConstructorReducer, {
  addIngredient,
  removeIngredient,
  clearConstructor,
  moveIngredient,
} from './burgerConstructorSlice';
import { createOrderThunk } from './orderSlice';

import type { TConstructorState, TIngredient } from '@/utils/types';

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

const mockBun: TIngredient = {
  _id: 'bun-1',
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
};

const mockMain: TIngredient = {
  _id: 'main-1',
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
};

// Хелпер: собирает состояние с булкой и тремя начинками
const stateWithIngredients = (): TConstructorState => {
  let state: TConstructorState = initialState;

  state = burgerConstructorReducer(state, addIngredient(mockBun));
  state = burgerConstructorReducer(state, addIngredient(mockMain));
  state = burgerConstructorReducer(state, addIngredient(mockMain));
  state = burgerConstructorReducer(state, addIngredient(mockMain));

  return state;
};

describe('burgerConstructorSlice', () => {
  describe('неизвестный экшен', () => {
    it('при передаче undefined в качестве состояния возвращает initialState', () => {
      const state = burgerConstructorReducer(undefined, { type: 'UNKNOWN' });

      expect(state).toEqual(initialState);
    });

    it('не изменяет существующее состояние', () => {
      const existingState = stateWithIngredients();
      const state = burgerConstructorReducer(existingState, { type: 'UNKNOWN' });

      expect(state).toEqual(existingState);
    });
  });

  describe('prepare-функция addIngredient', () => {
    it('добавляет к ингредиенту уникальный id', () => {
      const action = addIngredient(mockMain);

      expect(typeof action.payload.id).toBe('string');
      expect(action.payload).toEqual({ ...mockMain, id: action.payload.id });
    });

    it('генерирует разные id для разных вызовов', () => {
      const first = addIngredient(mockMain);
      const second = addIngredient(mockMain);

      expect(first.payload.id).not.toBe(second.payload.id);
    });
  });

  describe('addIngredient', () => {
    it('булка попадает в поле bun', () => {
      const state = burgerConstructorReducer(initialState, addIngredient(mockBun));

      expect(state.bun).not.toBeNull();
      expect(state.bun?._id).toBe(mockBun._id);
      expect(state.ingredients).toEqual([]);
    });

    it('небулочный ингредиент добавляется в конец массива ingredients', () => {
      const state = burgerConstructorReducer(initialState, addIngredient(mockMain));

      expect(state.bun).toBeNull();
      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0]._id).toBe(mockMain._id);
      expect(state.ingredients[0].id).toBeDefined();
    });

    it('несколько начинок добавляются в порядке вызова', () => {
      const state = stateWithIngredients();

      expect(state.ingredients).toHaveLength(3);
      expect(state.ingredients.every((item) => item._id === mockMain._id)).toBe(true);
      const ids = state.ingredients.map((item) => item.id);
      expect(new Set(ids).size).toBe(3);
    });
  });

  describe('removeIngredient', () => {
    it('удаляет ингредиент по его id, остальные остаются', () => {
      const fullState = stateWithIngredients();
      const idToRemove = fullState.ingredients[1].id;

      const state = burgerConstructorReducer(fullState, removeIngredient(idToRemove));

      expect(state.ingredients).toHaveLength(2);
      expect(state.ingredients.find((item) => item.id === idToRemove)).toBeUndefined();
    });

    it('если id не найден — состояние не меняется', () => {
      const fullState = stateWithIngredients();
      const state = burgerConstructorReducer(fullState, removeIngredient('nonexistent'));

      expect(state.ingredients).toHaveLength(3);
    });
  });

  describe('clearConstructor', () => {
    it('полностью очищает конструктор', () => {
      const fullState = stateWithIngredients();
      const state = burgerConstructorReducer(fullState, clearConstructor());

      expect(state.bun).toBeNull();
      expect(state.ingredients).toEqual([]);
    });
  });

  describe('moveIngredient', () => {
    it('перемещает ингредиент с позиции from на позицию to', () => {
      const fullState = stateWithIngredients();
      const ids = fullState.ingredients.map((item) => item.id);

      const state = burgerConstructorReducer(
        fullState,
        moveIngredient({ from: 0, to: 2 })
      );

      expect(state.ingredients.map((item) => item.id)).toEqual([ids[1], ids[2], ids[0]]);
    });

    it('перемещает ингредиент с конца в начало', () => {
      const fullState = stateWithIngredients();
      const ids = fullState.ingredients.map((item) => item.id);

      const state = burgerConstructorReducer(
        fullState,
        moveIngredient({ from: 2, to: 0 })
      );

      expect(state.ingredients.map((item) => item.id)).toEqual([ids[2], ids[0], ids[1]]);
    });
  });

  describe('createOrderThunk.fulfilled', () => {
    it('после успешного создания заказа конструктор очищается', () => {
      const fullState = stateWithIngredients();

      const action = { type: createOrderThunk.fulfilled.type, payload: {} };
      const state = burgerConstructorReducer(fullState, action);

      expect(state.bun).toBeNull();
      expect(state.ingredients).toEqual([]);
    });

    it('успешный заказ не затрагивает пустое состояние', () => {
      const action = { type: createOrderThunk.fulfilled.type, payload: {} };
      const state = burgerConstructorReducer(initialState, action);

      expect(state).toEqual(initialState);
    });
  });

  describe('createOrderThunk.pending / rejected', () => {
    it('pending и rejected не изменяют состояние конструктора', () => {
      const fullState = stateWithIngredients();

      expect(
        burgerConstructorReducer(fullState, { type: createOrderThunk.pending.type })
      ).toEqual(fullState);

      expect(
        burgerConstructorReducer(fullState, {
          type: createOrderThunk.rejected.type,
          error: { message: 'Ошибка' },
        })
      ).toEqual(fullState);
    });
  });
});
