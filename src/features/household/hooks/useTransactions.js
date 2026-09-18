// useTransactions.js
// 収支データの状態管理 + LocalStorage永続化を担うカスタムフック。
// データの読み書きロジックをここに集約することで、
// コンポーネント側はデータの「操作」だけに集中できる。

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'aifp_transactions'

export function useTransactions() {
  // --- 初期化: LocalStorageからデータを読み込む ---
  const [transactions, setTransactions] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('LocalStorageの読み込みに失敗しました:', e)
      return []
    }
  })

  // --- 同期: transactionsが変わるたびにLocalStorageへ書き込む ---
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
    } catch (e) {
      console.error('LocalStorageへの書き込みに失敗しました:', e)
    }
  }, [transactions])

  // --- 収支を追加する ---
  // data: { date, type, category, amount, memo }
  const addTransaction = (data) => {
    const newTx = {
      id: Date.now(),
      ...data,
    }
    setTransactions(prev => [newTx, ...prev])
  }

  // --- 収支を削除する ---
  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id))
  }

  // --- 収支を更新する ---
  // data: { date, type, category, amount, memo }
  const updateTransaction = (id, data) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, ...data } : tx)
    )
  }

  return { transactions, addTransaction, deleteTransaction, updateTransaction }
}
