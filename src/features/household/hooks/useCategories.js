// useCategories.js
// 収支のカテゴリ（デフォルト＋ユーザー追加）を管理するカスタムフック

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'aifp_custom_categories'

export const DEFAULT_CATEGORIES = {
  expense: [
    { label: '食費',       emoji: '🍴' },
    { label: '日用品',     emoji: '🛒' },
    { label: '交通費',     emoji: '🚃' },
    { label: '交際費',     emoji: '🍻' },
    { label: '娯楽',       emoji: '🎮' },
    { label: '医療・健康', emoji: '💊' },
    { label: '衣服・美容', emoji: '👗' },
    { label: '住居',       emoji: '🏠' },
    { label: '光熱費',     emoji: '💡' },
    { label: 'その他',     emoji: '📦' },
  ],
  income: [
    { label: '給与',     emoji: '💰' },
    { label: '副収入',   emoji: '💼' },
    { label: 'ボーナス', emoji: '🎁' },
    { label: 'その他',   emoji: '📦' },
  ],
}

export function useCategories() {
  // --- カスタムカテゴリをLocalStorageから読み込む ---
  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : { expense: [], income: [] }
    } catch (e) {
      console.error('LocalStorageの読み込みに失敗しました:', e)
      return { expense: [], income: [] }
    }
  })

  // --- 変更があったらLocalStorageへ保存 ---
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customCategories))
    } catch (e) {
      console.error('LocalStorageへの書き込みに失敗しました:', e)
    }
  }, [customCategories])

  // --- 全カテゴリ（デフォルト＋カスタム）を取得 ---
  const getCategories = () => {
    return {
      expense: [...DEFAULT_CATEGORIES.expense, ...customCategories.expense],
      income: [...DEFAULT_CATEGORIES.income, ...customCategories.income],
    }
  }

  // --- カテゴリの追加 ---
  const addCategory = (type, label, emoji) => {
    setCustomCategories(prev => {
      const existing = prev[type] || []
      // すでに同じ名前のカテゴリがある場合は追加しない
      if (existing.find(c => c.label === label) || DEFAULT_CATEGORIES[type].find(c => c.label === label)) {
        return prev
      }
      return {
        ...prev,
        [type]: [...existing, { label, emoji }]
      }
    })
  }

  // --- カテゴリの編集 ---
  const editCategory = (type, oldLabel, newLabel, newEmoji) => {
    setCustomCategories(prev => {
      const existing = prev[type] || []
      return {
        ...prev,
        [type]: existing.map(c => 
          c.label === oldLabel ? { label: newLabel, emoji: newEmoji } : c
        )
      }
    })
  }

  // --- カテゴリの削除 ---
  const deleteCategory = (type, label) => {
    setCustomCategories(prev => {
      const existing = prev[type] || []
      return {
        ...prev,
        [type]: existing.filter(c => c.label !== label)
      }
    })
  }

  return {
    categories: getCategories(),
    customCategories,
    addCategory,
    editCategory,
    deleteCategory
  }
}
