#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int H, W;
    cin >> H >> W;
    vector<vector<int>> A(H, vector<int>(W));
    rep(i, H) rep(j, W) cin >> A[i][j];
    vector<int> row_sum(H), col_sum(W);
    rep(i, H) rep(j, W) {
        row_sum[i] += A[i][j];
        col_sum[j] += A[i][j];
    }

    rep(i, H) {
        rep(j, W) {
            cout << row_sum[i] + col_sum[j] - A[i][j];
            if (j < W - 1) cout << " ";
        }
        cout << endl;
    }
}
