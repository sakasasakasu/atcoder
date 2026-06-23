#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N;
    char X;
    cin >> N >> X;
    vector<string> S(N);
    rep(i, N) cin >> S.at(i);

    bool ans = false;
    rep(i, N) {
        rep(j, N) {
            if (j == X - 'A' && S.at(i).at(j) == 'o') {
                ans = true;
            }
        }
    }

    cout << (ans ? "Yes" : "No") << endl;
}
