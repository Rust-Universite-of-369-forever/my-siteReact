import React from 'react';
import PropTypes from 'prop-types';
import {
  load,
  save,
  STORAGE_KEYS,
  getGenderedAvatars,
  compressImage,
} from '../utils/storage';

class AuthForm extends React.Component {
  static propTypes = {
    onLogin: PropTypes.func.isRequired,
    onGuest: PropTypes.func.isRequired,
  };

  state = {
    mode: 'login',
    login: '',
    password: '',
    gender: '',
    avatarOptions: [],
    selectedAvatar: '',
    customAvatarUrl: '',
    avatarFile: null,
    avatarPreview: '',
    agree: false,
    error: '',
  };

  handleChange = (field) => (e) =>
    this.setState({ [field]: e.target.value, error: '' });

  handleGenderChange = (gender) => {
    const options = getGenderedAvatars(gender, 4);
    this.setState({
      gender,
      avatarOptions: options,
      selectedAvatar: options[0],
      customAvatarUrl: '',
      avatarFile: null,
      avatarPreview: '',
      error: '',
    });
  };

  selectAvatar = (url) => {
    const fileInput = this.fileInputRef;
    if (fileInput) fileInput.value = '';
    this.setState({
      selectedAvatar: url,
      customAvatarUrl: '',
      avatarFile: null,
      avatarPreview: '',
      error: '',
    });
  };

  handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      e.target.value = '';
      return this.setState({ error: 'Можно загружать только изображения' });
    }
    if (file.size > 5 * 1024 * 1024) {
      e.target.value = '';
      return this.setState({ error: 'Файл слишком большой (макс. 5 МБ)' });
    }

    try {
      const compressed = await compressImage(file, 256, 0.8);
      this.setState({
        avatarFile: file,
        avatarPreview: compressed,
        selectedAvatar: compressed,
        customAvatarUrl: '',
        error: '',
      });
    } catch {
      this.setState({ error: 'Не удалось обработать изображение' });
    }
  };

  handleCustomUrl = (e) => {
    const url = e.target.value;
    this.setState({
      customAvatarUrl: url,
      selectedAvatar: url,
      avatarFile: null,
      avatarPreview: '',
      error: '',
    });
  };

  isValidAvatarUrl = (url) => {
    if (!url) return false;
    if (url.startsWith('data:image/')) return true;
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { mode, login, password, selectedAvatar, agree } = this.state;
    const users = load(STORAGE_KEYS.users, []);

    const trimmedLogin = login.trim();
    const trimmedPassword = password.trim();

    if (!trimmedLogin || !trimmedPassword) {
      return this.setState({ error: 'Заполните все поля' });
    }

    if (mode === 'register') {
      if (!agree) return this.setState({ error: 'Примите условия ресурса' });
      if (users.find((u) => u.login === trimmedLogin)) {
        return this.setState({ error: 'Пользователь уже существует' });
      }
      if (!selectedAvatar || !this.isValidAvatarUrl(selectedAvatar)) {
        return this.setState({ error: 'Выберите корректную аватарку' });
      }

      users.push({
        login: trimmedLogin,
        password: trimmedPassword,
        avatar: selectedAvatar,
        gender: this.state.gender || 'other',
      });

      save(STORAGE_KEYS.users, users);
      this.props.onLogin({ login: trimmedLogin, avatar: selectedAvatar });
    } else {
      const user = users.find(
        (u) => u.login === trimmedLogin && u.password === trimmedPassword
      );
      if (!user) return this.setState({ error: 'Неверный логин или пароль' });
      this.props.onLogin({ login: user.login, avatar: user.avatar });
    }
  };

  toggleMode = () =>
    this.setState((s) => ({
      mode: s.mode === 'login' ? 'register' : 'login',
      error: '',
      login: '',
      password: '',
      gender: '',
      avatarOptions: [],
      selectedAvatar: '',
      customAvatarUrl: '',
      avatarFile: null,
      avatarPreview: '',
      agree: false,
    }));

  setFileInputRef = (el) => {
    this.fileInputRef = el;
  };

  render() {
    const {
      mode,
      login,
      password,
      gender,
      avatarOptions,
      selectedAvatar,
      customAvatarUrl,
      avatarPreview,
      agree,
      error,
    } = this.state;

    const isRegister = mode === 'register';
    const isCustomSelected = !!avatarPreview || !!customAvatarUrl;

    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-image" />
          <form className="auth-form" onSubmit={this.handleSubmit}>
            <h2>{isRegister ? 'Регистрация' : 'Авторизация'}</h2>
            {error && <div className="auth-error">{error}</div>}
            <input
              type="text"
              placeholder="Логин"
              value={login}
              onChange={this.handleChange('login')}
              autoComplete="username"
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={this.handleChange('password')}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
            {isRegister && (
              <>
                <div className="gender-section">
                  <label className="gender-label">Выберите пол:</label>
                  <div className="gender-buttons">
                    <button
                      type="button"
                      className={`gender-btn ${gender === 'male' ? 'active' : ''}`}
                      onClick={() => this.handleGenderChange('male')}
                    >
                      Мужской
                    </button>
                    <button
                      type="button"
                      className={`gender-btn ${gender === 'female' ? 'active' : ''}`}
                      onClick={() => this.handleGenderChange('female')}
                    >
                      Женский
                    </button>
                  </div>
                </div>

                {gender && (
                  <div className="avatar-section">
                    <label className="avatar-label">Выберите аватарку:</label>

                    <div className="avatar-grid">
                      {avatarOptions.map((url, idx) => {
                        const isSelected =
                          selectedAvatar === url && !isCustomSelected;
                        return (
                          <div
                            key={idx}
                            className={`avatar-option ${isSelected ? 'selected' : ''}`}
                            onClick={() => this.selectAvatar(url)}
                          >
                            <img src={url} alt={`option-${idx}`} />
                            {isSelected && <div className="avatar-check">✓</div>}
                          </div>
                        );
                      })}
                    </div>

                    <div className="avatar-custom">
                      <input
                        type="text"
                        placeholder="Или вставьте URL аватарки"
                        value={customAvatarUrl}
                        onChange={this.handleCustomUrl}
                      />
                      <label className="file-label">
                        <span>📁 Загрузить с компьютера</span>
                        <input
                          ref={this.setFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={this.handleFileChange}
                        />
                      </label>
                    </div>

                    {(selectedAvatar || avatarPreview) && (
                      <div className="avatar-preview-wrap">
                        <img
                          className="avatar-preview"
                          src={avatarPreview || selectedAvatar}
                          alt="preview"
                        />
                        <span className="preview-text">Выбрано</span>
                      </div>
                    )}
                  </div>
                )}

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => this.setState({ agree: e.target.checked })}
                  />
                  Я согласен с условиями ресурса
                </label>
              </>
            )}
            <div className="auth-buttons">
              <button
                type="button"
                className="btn-register"
                onClick={this.toggleMode}
              >
                {mode === 'login' ? 'РЕГИСТРАЦИЯ' : 'ВОЙТИ'}
              </button>
              <button type="submit" className="btn-login">
                {mode === 'login' ? 'ВОЙТИ' : 'СОЗДАТЬ'}
              </button>
            </div>
            <button
              type="button"
              className="btn-guest"
              onClick={(e) => {
                e.preventDefault();
                this.props.onGuest();
              }}
            >
              Войти как гость
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default AuthForm;