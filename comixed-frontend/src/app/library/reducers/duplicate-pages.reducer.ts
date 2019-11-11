/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import {
  DuplicatePagesActions,
  DuplicatePagesActionTypes
} from '../actions/duplicate-pages.actions';
import { DuplicatePage } from 'app/library/models/duplicate-page';

export const DUPLICATE_PAGES_FEATURE_KEY = 'duplicatePages';

export interface DuplicatePagesState {
  fetchingAll: boolean;
  pages: DuplicatePage[];
}

export const initialState: DuplicatePagesState = {
  fetchingAll: false,
  pages: []
};

export function reducer(
  state = initialState,
  action: DuplicatePagesActions
): DuplicatePagesState {
  switch (action.type) {
    case DuplicatePagesActionTypes.GetAll:
      return { ...state, fetchingAll: true };

    case DuplicatePagesActionTypes.AllReceived:
      return { ...state, fetchingAll: false, pages: action.payload.pages };

    case DuplicatePagesActionTypes.GetAllFailed:
      return { ...state, fetchingAll: false };

    default:
      return state;
  }
}
