import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils';
import axios from 'axios';
import AccountService from '@/account/account.service';
import router from '@/router';
import TranslationService from '@/locale/translation.service';
import TrackerService from '@/admin/tracker/tracker.service';

import * as config from '@/shared/config/config';
import LoginForm from '@/account/login-form/login-form.vue';
import LoginFormClass from '@/account/login-form/login-form.component';

const localVue = createLocalVue();
localVue.component('b-alert', {});
localVue.component('b-button', {});
localVue.component('b-form', {});
localVue.component('b-form-input', {});
localVue.component('b-form-group', {});
localVue.component('b-form-checkbox', {});
localVue.component('b-link', {});
const mockedAxios: any = axios;

config.initVueApp(localVue);
const i18n = config.initI18N(localVue);
const store = config.initVueXStore(localVue);

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe('LoginForm Component', () => {
  let wrapper: Wrapper<LoginFormClass>;
  let loginForm: LoginFormClass;

  beforeEach(() => {
    mockedAxios.get.mockReset();
    mockedAxios.get.mockReturnValue(Promise.resolve({}));
    mockedAxios.post.mockReset();

    wrapper = shallowMount<LoginFormClass>(LoginForm, {
      store,
      i18n,
      localVue,
      provide: {
        accountService: () =>
          new AccountService(store, new TranslationService(store, i18n), { get: () => {} }, new TrackerService(router), router),
      },
    });
    loginForm = wrapper.vm;
  });

  it('should authentication be KO', async () => {
    // GIVEN
    loginForm.login = 'login';
    loginForm.password = 'pwd';
    loginForm.rememberMe = true;
    mockedAxios.post.mockReturnValue(Promise.reject());

    // WHEN
    loginForm.doLogin();
    await loginForm.$nextTick();

    // THEN
    expect(mockedAxios.post).toHaveBeenCalledWith('api/authentication', 'username=login&password=pwd&remember-me=true&submit=Login', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    await loginForm.$nextTick();
    expect(loginForm.authenticationError).toBeTruthy();
  });

  it('should authentication be OK', async () => {
    // GIVEN
    loginForm.login = 'login';
    loginForm.password = 'pwd';
    loginForm.rememberMe = true;
    mockedAxios.post.mockReturnValue(Promise.resolve({}));

    // WHEN
    loginForm.doLogin();
    await loginForm.$nextTick();

    // THEN
    expect(mockedAxios.post).toHaveBeenCalledWith('api/authentication', 'username=login&password=pwd&remember-me=true&submit=Login', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    expect(loginForm.authenticationError).toBeFalsy();
  });
});