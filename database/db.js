const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class Database {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.toolUsageFile = path.join(this.dataDir, 'tool_usage.json');
    this.favoritesFile = path.join(this.dataDir, 'favorites.json');
    this.feedbackFile = path.join(this.dataDir, 'feedback.json');
  }

  async init() {
    try {
      // 确保数据目录存在
      await fs.ensureDir(this.dataDir);
      
      // 初始化数据文件
      await this.initDataFile(this.usersFile, []);
      await this.initDataFile(this.toolUsageFile, []);
      await this.initDataFile(this.favoritesFile, []);
      await this.initDataFile(this.feedbackFile, []);
      
      console.log('✅ 数据库初始化成功');
    } catch (error) {
      console.error('数据库初始化失败:', error);
    }
  }

  async initDataFile(filePath, defaultData) {
    try {
      await fs.access(filePath);
    } catch (error) {
      // 文件不存在，创建默认文件
      await fs.writeJson(filePath, defaultData, { spaces: 2 });
    }
  }

  async readData(filePath) {
    try {
      return await fs.readJson(filePath);
    } catch (error) {
      console.error(`读取数据文件失败: ${filePath}`, error);
      return [];
    }
  }

  async writeData(filePath, data) {
    try {
      await fs.writeJson(filePath, data, { spaces: 2 });
    } catch (error) {
      console.error(`写入数据文件失败: ${filePath}`, error);
      throw error;
    }
  }

  // 用户相关方法
  async createUser(userData) {
    try {
      const users = await this.readData(this.usersFile);
      const { username, email, passwordHash } = userData;
      
      const newUser = {
        id: uuidv4(),
        username,
        email,
        password_hash: passwordHash,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        user_type: 'free'
      };

      users.push(newUser);
      await this.writeData(this.usersFile, users);
      
      return { id: newUser.id, username, email };
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const users = await this.readData(this.usersFile);
      return users.find(user => user.email === email);
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const users = await this.readData(this.usersFile);
      const user = users.find(user => user.id === id);
      if (user) {
        // 不返回密码哈希
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // 工具使用记录
  async recordToolUsage(userId, toolName) {
    try {
      const toolUsage = await this.readData(this.toolUsageFile);
      const existingRecord = toolUsage.find(
        record => record.user_id === userId && record.tool_name === toolName
      );

      if (existingRecord) {
        existingRecord.usage_count += 1;
        existingRecord.last_used = new Date().toISOString();
      } else {
        toolUsage.push({
          id: uuidv4(),
          user_id: userId,
          tool_name: toolName,
          usage_count: 1,
          last_used: new Date().toISOString()
        });
      }

      await this.writeData(this.toolUsageFile, toolUsage);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 获取用户工具使用统计
  async getUserToolStats(userId) {
    try {
      const toolUsage = await this.readData(this.toolUsageFile);
      return toolUsage
        .filter(record => record.user_id === userId)
        .sort((a, b) => b.usage_count - a.usage_count);
    } catch (error) {
      throw error;
    }
  }

  // 收藏工具
  async addFavorite(userId, toolName) {
    try {
      const favorites = await this.readData(this.favoritesFile);
      const existingFavorite = favorites.find(
        fav => fav.user_id === userId && fav.tool_name === toolName
      );

      if (existingFavorite) {
        return false; // 已经收藏过了
      }

      favorites.push({
        id: uuidv4(),
        user_id: userId,
        tool_name: toolName,
        created_at: new Date().toISOString()
      });

      await this.writeData(this.favoritesFile, favorites);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 取消收藏
  async removeFavorite(userId, toolName) {
    try {
      const favorites = await this.readData(this.favoritesFile);
      const initialLength = favorites.length;
      
      const updatedFavorites = favorites.filter(
        fav => !(fav.user_id === userId && fav.tool_name === toolName)
      );

      if (updatedFavorites.length < initialLength) {
        await this.writeData(this.favoritesFile, updatedFavorites);
        return true;
      }
      
      return false;
    } catch (error) {
      throw error;
    }
  }

  // 获取用户收藏
  async getUserFavorites(userId) {
    try {
      const favorites = await this.readData(this.favoritesFile);
      return favorites
        .filter(fav => fav.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
      throw error;
    }
  }

  close() {
    // JSON文件存储不需要关闭连接
    console.log('数据库连接已关闭');
  }
}

module.exports = Database; 