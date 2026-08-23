#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using ll = long long;
using namespace std;

int dx[4] = {1, -1, 0, 0};
int dy[4] = {0, 0, 1, -1};

int main() {
    int H, W, K;
    cin >> H >> W >> K;
    vector<vector<char>> S(H, vector<char>(W));
    rep(i, H) rep(j, W) cin >> S.at(i).at(j);

    vector<bool> r_bomb(H, false), l_bomb(W, false);
    rep(i, H) rep(j, W) {
        if (S.at(i).at(j) == '#') {
            r_bomb.at(i) = true;
            l_bomb.at(j) = true;
        }
    }

    vector<vector<int>> dist(H, vector<int>(W, -1));
    queue<pair<int, int>> q;

    rep(i, H) rep(j, W) {
        if (S.at(i).at(j) == '.' && !r_bomb.at(i) && !l_bomb.at(j)) {
            dist.at(i).at(j) = 0;
            q.push({i, j});
        }
    }

    while (!q.empty()) {
        auto [x, y] = q.front();
        q.pop();

        for (int d = 0; d < 4; ++d) {
            int nx = x + dx[d];
            int ny = y + dy[d];

            if (nx >= 0 && nx < H && ny >= 0 && ny < W) {
                if (S.at(nx).at(ny) == '.' && dist.at(nx).at(ny) == -1) {
                    dist.at(nx).at(ny) = dist.at(x).at(y) + 1;
                    q.push({nx, ny});
                }
            }
        }
    }

    int ans = 0;
    rep(i, H) rep(j, W) {
        if(S.at(i).at(j) == '.' && dist.at(i).at(j) != -1 && dist.at(i).at(j) <= K) {
            ans++;
        }
    }

    cout << ans << endl;
}
