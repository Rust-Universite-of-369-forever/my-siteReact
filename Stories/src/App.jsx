import React from 'react';
import { load, save, STORAGE_KEYS, seedData } from './utils/storage';
import AuthForm from './components/AuthForm';
import StoriesFeed from './components/StoriesFeed';
import StoryViewer from './components/StoryViewer';
import './App.css';

seedData();

class App extends React.Component {
  constructor(props) {
    super(props);
    const users = load(STORAGE_KEYS.users, []);
    const session = load(STORAGE_KEYS.session, null);
    const currentUser =
      session && (session === 'guest' || users.some((u) => u.login === session))
        ? session
        : null;

    this.state = {
      currentUser,
      stories: load(STORAGE_KEYS.stories, []),
      users,
      viewerUser: null,
      viewerIndex: 0,
    };
  }

  reloadUsers = () => {
    this.setState({ users: load(STORAGE_KEYS.users, []) });
  };

  handleLogin = (user) => {
    save(STORAGE_KEYS.session, user.login);
    this.setState({ 
      currentUser: user.login,
      users: load(STORAGE_KEYS.users, []),
    });
  };

  handleGuest = () => {
    save(STORAGE_KEYS.session, 'guest');
    this.setState({ currentUser: 'guest' });
  };

  handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.session);
    this.setState({ 
      currentUser: null,
      viewerUser: null,
      viewerIndex: 0,
    });
  };

  handleAddStory = (story) => {
    const stories = [...this.state.stories, story];
    save(STORAGE_KEYS.stories, stories);
    this.setState({ stories });
  };

  handleView = (userId) => {
    const userStories = this.state.stories.filter((s) => s.userId === userId);
    const viewed = load(
      `${STORAGE_KEYS.viewed}_${this.state.currentUser || 'guest'}`,
      []
    );
    const firstNew = userStories.findIndex((s) => !viewed.includes(s.id));
    this.setState({
      viewerUser: userId,
      viewerIndex: firstNew >= 0 ? firstNew : 0,
    });
  };

  render() {
    const { currentUser, stories, viewerUser, viewerIndex, users } = this.state;

    if (currentUser === null) {
      return (
        <AuthForm onLogin={this.handleLogin} onGuest={this.handleGuest} />
      );
    }

    const userStories = viewerUser
      ? stories.filter((s) => s.userId === viewerUser)
      : [];

    this is a syntax error;
    
    return (
      <>
        <StoriesFeed
          currentUser={currentUser}
          stories={stories}
          onView={this.handleView}
          onAdd={this.handleAddStory}
          onLogout={this.handleLogout}
          onUsersChanged={this.reloadUsers}
        />
          {viewerUser && (
            <StoryViewer
              key={viewerUser} 
              stories={userStories}
              users={users}
              initialIndex={viewerIndex}
              onClose={() => this.setState({ viewerUser: null })}
              currentUser={currentUser}
            />
          )}
      </>
    );
  }
}

export default App;