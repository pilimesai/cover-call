# 專案規則

## 自動上傳 GitHub
每次修改這個專案的檔案後，完成並通過驗證（如 `node --test tests/engine.test.cjs tests/worker.test.mjs`）後，都要自動 commit 並推送到 GitHub，不用再問使用者：

```powershell
git add -A
git -c user.name=pilimesai -c user.email=pilimesai@users.noreply.github.com commit -m "<簡短描述這次改動>"
git push
```

- 遠端：https://github.com/pilimesai/tx-calendar-spread-tool（`main` 分支）
- 如果使用者已經設定全域的 `user.name` / `user.email`，就改用全域設定，不要加 `-c` 參數。
- 測試失敗時不要推送，先修好。
- 推送後執行 `git status -sb` 確認本機與 `origin/main` 同步，並在回覆中附上 commit 雜湊。
