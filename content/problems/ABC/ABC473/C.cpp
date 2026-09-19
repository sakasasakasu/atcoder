#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N, K;
    cin >> N >> K;
    vector<int> cl(K + 2, 0);
    rep (i, N) {
        int t;
        cin >> t;
        cl.at(t)++;
    }

    int max_val = 0;
    for (int i = 1; i <= K; i++) max_val = max(max_val, cl.at(i));

    int ans = 0;
    for (int i = 1; i <= K; i++) {
        if (cl.at(i) >= max_val - 1) ans++;
    }

    cout << ans << endl;
    return 0;
}
