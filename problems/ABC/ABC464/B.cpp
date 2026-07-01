#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int H, W;
    cin >> H >> W;
    vector<vector<char>> C(H, vector<char>(W));
    rep(i, H) rep(j, W) cin >> C.at(i).at(j);

    int minH = H;
    int minW = W;
    int maxH = -1;
    int maxW = -1;

    rep(i, H) {
        rep (j, W) {
            if (C.at(i).at(j) == '#') {
                minH = min(minH, i);
                minW = min(minW, j);
                maxH = max(maxH, i);
                maxW = max(maxW, j);
            }
        }
    }

    for (int i = minH; i <= maxH; i++) {
        for (int j = minW; j <= maxW; j++) {
            cout << C.at(i).at(j);
        }
        cout << endl;
    }
}
