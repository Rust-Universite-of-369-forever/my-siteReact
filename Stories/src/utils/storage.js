const STORAGE = {
  users: 'stories_users',
  stories: 'stories_items',
  viewed: 'stories_viewed',
  session: 'stories_session',
};

export const load = (key, def = null) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? def;
  } catch {
    return def;
  }
};

export const save = (key, value) =>
{
  try{
      localStorage.setItem(key, JSON.stringify(value));
  }catch(e){
    console.error('Ошибка сохранения', e)
  }
};

export const getGenderedAvatars = (gender, count = 4) => {
  const baseIds =
    gender === 'male'
      ? [1, 3, 8, 9, 11, 12, 13, 15, 19, 20, 22, 24, 28, 32, 33, 35, 36, 41, 42, 44, 46, 47, 49, 51, 52, 56, 59, 60, 61, 62, 63, 64, 66, 67, 68, 70, 71, 72, 73, 74]
      : [2, 4, 5, 6, 7, 10, 14, 16, 17, 18, 21, 23, 25, 26, 27, 29, 30, 31, 34, 37, 38, 39, 40, 43, 45, 48, 50, 53, 54, 55, 57, 58, 65, 69];

  const shuffled = [...baseIds].sort(() => Math.random() - 0.5);
  return Array.from({ length: count }, (_, i) =>
    `https://i.pravatar.cc/150?img=${shuffled[i % shuffled.length]}`
  );
};

export const generateAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=random&color=fff&size=150&bold=true`;

export const compressImage = (file, maxSize = 256, quality = 0.8) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Не удалось загрузить изображение'));
      img.onload = () => {
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (e) {
          reject(e);
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

export const seedData = () => {
  if (!load(STORAGE_KEYS.users)) {
    save(STORAGE_KEYS.users, [
      {
        login: 'demo',
        password: '123',
        avatar: 'https://i.pravatar.cc/150?img=12',
        gender: 'male',
      },
      {
        login: 'anna',
        password: '123',
        avatar: 'https://i.pravatar.cc/150?img=5',
        gender: 'female',
      },
      {
        login: 'ivan',
        password: '123',
        avatar: 'https://i.pravatar.cc/150?img=33',
        gender: 'male',
      },
    ]);
  }
  if (!load(STORAGE.stories)) {
    save(STORAGE.stories, [
      {
        id: 1, userId: 'demo', title: 'Космос',
        text: 'Сегодня увидел невероятный закат 🌌',
        image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600',
        createdAt: Date.now() - 3600000,
      },
      {
        id: 2, userId: 'demo', title: 'Мысли',
        text: 'Тишина — это тоже ответ.',
        image: '', createdAt: Date.now() - 1800000,
      },
      {
        id: 3, userId: 'anna', title: 'Утро',
        text: 'Кофе и книга ☕',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
        createdAt: Date.now() - 7200000,
      },
      {
        id: 4, userId: 'ivan', title: 'Горы',
        text: 'Поднялись на вершину!',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
        createdAt: Date.now() - 5400000,
      },
    ]);
  }
};

export const STORAGE_KEYS = STORAGE;