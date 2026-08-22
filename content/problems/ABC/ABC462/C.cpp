#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N;
    cin >> N;

    /*
        pair<int, int> points;
        rep(i, N) {
            int x, y;
            cin >> x >> y;
            points = {x, y};
        }
    */

    vector<int> points(N + 1);
    rep(i, N) {
        int x, y;
        cin >> x >> y;
        points.at(x) = y;
    }

    int ans = 0;
    int min_y = 1e9;

    for (int i = 1; i <= N; i++) {
        int cy = points.at(i);

        if (cy < min_y) {
            ans++;
            min_y = cy;
        }
    }

    cout << ans << endl;
}
