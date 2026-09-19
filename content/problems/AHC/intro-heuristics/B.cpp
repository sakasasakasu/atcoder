#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

// 1. 入力データを保持する構造体
struct Input {
    int D;
    vector<int> c;
    vector<vector<int>> s;
};

int evaluate(const Input& input, const vector<int>& out, int k) {
    int score = 0;
    vector<int> last(26, 0);

    for (int day = 0; day < (int)out.size(); day++) {
        int t = out[day];
        score += input.s[day][t];
        last[t] = day + 1;

        for (int i = 0; i < 26; i++) {
            score -= input.c[i] * ((day + 1) - last[i]);
        }
    }

    int future_end = min((int)out.size() + k, input.D);
    for (int day = (int)out.size(); day < future_end; day++) {
        for (int i = 0; i < 26; i++) {
            score -= input.c[i] * ((day + 1) - last[i]);
        }
    }
    return score;
}

vector<int> solve(const Input& input, int k) {
    vector<int> out;

    for (int d = 0; d < input.D; d++) {
        int max_score = -1e9;
        int best_i = 0;

        // タイプ 0 〜 25 を試しに配置してみる
        for (int i = 0; i < 26; i++) {
            out.push_back(i);
            int score = evaluate(input, out, k);

            if (score > max_score) {
                max_score = score;
                best_i = i;
            }
            out.pop_back();
        }

        // 最もスコアが高かったタイプを確定
        out.push_back(best_i);
    }

    return out;
}

int main() {
    // 高速入出力
    cin.tie(nullptr);
    ios::sync_with_stdio(false);

    Input input;
    if (!(cin >> input.D)) return 0;

    input.c.resize(26);
    for (int i = 0; i < 26; i++) {
        cin >> input.c[i];
    }

    input.s.assign(input.D, vector<int>(26));
    for (int i = 0; i < input.D; i++) {
        for (int j = 0; j < 26; j++) {
            cin >> input.s[i][j];
        }
    }

    // 貪欲法を実行
    int k = 16;
    vector<int> ans = solve(input, k);

    // 出力（問題の指定に合わせて 1-indexed に戻して出力）
    for (int t : ans) {
        cout << t + 1 << "\n";
    }

    return 0;
}
