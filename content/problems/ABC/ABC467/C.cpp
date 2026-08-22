#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N, M;
    cin >> N >> M;
    vector<int> A(N), B(N - 1);
    rep(i, N) cin >> A.at(i);
    rep(i, N - 1) cin >> B.at(i);

    int ans = 2e9;
    int ans_neo = 0;

    for (int i = 0; i < 2; i++) {
        vector<int> A_neo = A;
        ans_neo = 0;

        if (i == 1) {
            A_neo.at(0)++;
            ans_neo++;
        }

        for (int j = 0; j < N - 1; j++) {
            if ((A_neo.at(j) + A_neo.at(j + 1)) % 2 != B.at(j)) {
                ans_neo++;
                A_neo.at(j + 1)++;
            }
        }

        ans = min(ans, ans_neo);
    }

    cout << ans << endl;
}
