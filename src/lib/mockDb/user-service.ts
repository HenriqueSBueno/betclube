
import { users } from './models';
import { User } from '@/types';

export const userService = {
  findByEmail: (email: string) => users.find(user => user.email === email),
  findById: (id: string) => users.find(user => user.id === id),
  create: (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: String(users.length + 1) };
    users.push(newUser);
    return newUser;
  },
  update: (id: string, userData: Partial<User>) => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...userData };
      return users[index];
    }
    return null;
  }
};
