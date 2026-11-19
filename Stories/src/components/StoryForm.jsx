import React from 'react';
import PropTypes from 'prop-types';

class StoryForm extends React.Component {
  static propTypes = {
    currentUser: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
  };

  state = { title: '', text: '', image: '', error: '' };

  handleChange = (field) => (e) =>
    this.setState({ [field]: e.target.value, error: '' });

  handleSubmit = (e) => {
    e.preventDefault();
    const { title, text, image } = this.state;
    if (!title.trim() || !text.trim()) {
      return this.setState({ error: 'Заполните заголовок и текст' });
    }
    if (image.trim()) {
      try {
        const u = new URL(image.trim());
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          throw new Error('bad protocol');
        }
      } catch {
        return this.setState({
          error: 'URL картинки должен начинаться с http(s)://',
        });
      }
    }
    this.props.onAdd({
      id: Date.now(),
      userId: this.props.currentUser,
      title: title.trim(),
      text: text.trim(),
      image: image.trim(),
      createdAt: Date.now(),
    });
    this.props.onClose();
  };

  render() {
    const { title, text, image, error } = this.state;
    return (
      <div className="modal-overlay" onClick={this.props.onClose}>
        <div
          className="modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <h3>Новая история</h3>
          {error && <div className="auth-error">{error}</div>}
          <input
            type="text"
            placeholder="Заголовок"
            value={title}
            onChange={this.handleChange('title')}
            maxLength={80}
          />
          <textarea
            placeholder="Текст истории"
            value={text}
            onChange={this.handleChange('text')}
            maxLength={500}
          />
          <input
            type="text"
            placeholder="URL картинки (необязательно)"
            value={image}
            onChange={this.handleChange('image')}
          />
          <div className="modal-buttons">
            <button className="cancel" onClick={this.props.onClose}>
              Отмена
            </button>
            <button className="submit" onClick={this.handleSubmit}>
              Опубликовать
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default StoryForm;