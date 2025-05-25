const express = require('express');
const authRoutes = require('./auth');
const Database = require('../database/db');

const router = express.Router();
const db = new Database();
const authenticateToken = authRoutes.authenticateToken;

// 获取用户统计信息
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // 获取工具使用统计
    const toolStats = await db.getUserToolStats(userId);
    
    // 获取收藏列表
    const favorites = await db.getUserFavorites(userId);

    // 计算总使用次数
    const totalUsage = toolStats.reduce((sum, tool) => sum + tool.usage_count, 0);

    // 获取最常用的工具
    const mostUsedTool = toolStats.length > 0 ? toolStats[0] : null;

    res.json({
      stats: {
        totalUsage,
        toolsUsed: toolStats.length,
        favoritesCount: favorites.length,
        mostUsedTool: mostUsedTool ? {
          name: mostUsedTool.tool_name,
          count: mostUsedTool.usage_count,
          lastUsed: mostUsedTool.last_used
        } : null
      },
      toolUsage: toolStats,
      favorites: favorites.map(fav => ({
        toolName: fav.tool_name,
        addedAt: fav.created_at
      }))
    });

  } catch (error) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({ error: '获取统计信息失败' });
  }
});

// 获取用户收藏的工具
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const favorites = await db.getUserFavorites(req.user.userId);
    res.json({ favorites });
  } catch (error) {
    console.error('获取收藏列表错误:', error);
    res.status(500).json({ error: '获取收藏列表失败' });
  }
});

// 获取用户工具使用历史
router.get('/usage-history', authenticateToken, async (req, res) => {
  try {
    const toolStats = await db.getUserToolStats(req.user.userId);
    
    // 按使用次数排序并格式化数据
    const history = toolStats.map(tool => ({
      toolName: tool.tool_name,
      usageCount: tool.usage_count,
      lastUsed: tool.last_used,
      // 计算使用频率等级
      frequency: tool.usage_count >= 10 ? 'high' : 
                tool.usage_count >= 5 ? 'medium' : 'low'
    }));

    res.json({ 
      history,
      summary: {
        totalTools: history.length,
        totalUsage: history.reduce((sum, tool) => sum + tool.usageCount, 0),
        highFrequencyTools: history.filter(tool => tool.frequency === 'high').length
      }
    });

  } catch (error) {
    console.error('获取使用历史错误:', error);
    res.status(500).json({ error: '获取使用历史失败' });
  }
});

// 更新用户资料
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, avatarUrl } = req.body;
    const userId = req.user.userId;

    // 这里应该添加数据库更新用户资料的方法
    // 暂时返回成功响应
    res.json({ 
      message: '资料更新成功',
      user: {
        id: userId,
        username,
        avatarUrl
      }
    });

  } catch (error) {
    console.error('更新资料错误:', error);
    res.status(500).json({ error: '更新资料失败' });
  }
});

// 获取用户活动时间线
router.get('/timeline', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // 获取最近的工具使用记录
    const toolStats = await db.getUserToolStats(userId);
    const favorites = await db.getUserFavorites(userId);

    // 创建时间线数据
    const timeline = [];

    // 添加工具使用记录
    toolStats.forEach(tool => {
      timeline.push({
        type: 'tool_usage',
        action: '使用了工具',
        toolName: tool.tool_name,
        count: tool.usage_count,
        timestamp: tool.last_used,
        icon: '🔧'
      });
    });

    // 添加收藏记录
    favorites.forEach(fav => {
      timeline.push({
        type: 'favorite',
        action: '收藏了工具',
        toolName: fav.tool_name,
        timestamp: fav.created_at,
        icon: '⭐'
      });
    });

    // 按时间排序
    timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ 
      timeline: timeline.slice(0, 20), // 只返回最近20条记录
      total: timeline.length
    });

  } catch (error) {
    console.error('获取时间线错误:', error);
    res.status(500).json({ error: '获取时间线失败' });
  }
});

// 用户反馈
router.post('/feedback', authenticateToken, async (req, res) => {
  try {
    const { toolName, rating, comment } = req.body;
    const userId = req.user.userId;

    if (!toolName || !rating) {
      return res.status(400).json({ error: '请提供工具名称和评分' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: '评分必须在1-5之间' });
    }

    // 这里应该添加保存反馈到数据库的逻辑
    // 暂时返回成功响应
    res.json({ 
      message: '反馈提交成功',
      feedback: {
        toolName,
        rating,
        comment,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('提交反馈错误:', error);
    res.status(500).json({ error: '提交反馈失败' });
  }
});

// 获取推荐工具
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const toolStats = await db.getUserToolStats(userId);

    // 基于用户使用历史推荐工具
    const usedTools = toolStats.map(tool => tool.tool_name);
    
    // 简单的推荐逻辑：推荐用户未使用过的工具
    const allTools = [
      'text-generator', 'image-generator', 'code-assistant', 
      'translation', 'content-optimizer', 'voice-synthesis'
    ];
    
    const recommendations = allTools
      .filter(tool => !usedTools.includes(tool))
      .map(tool => ({
        toolName: tool,
        reason: '基于您的使用偏好推荐',
        score: Math.random() * 100 // 模拟推荐分数
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    res.json({ 
      recommendations,
      message: recommendations.length > 0 ? 
        '为您推荐以下工具' : '您已经尝试过所有工具了！'
    });

  } catch (error) {
    console.error('获取推荐错误:', error);
    res.status(500).json({ error: '获取推荐失败' });
  }
});

module.exports = router; 