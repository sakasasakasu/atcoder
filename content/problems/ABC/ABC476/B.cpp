#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N;
    string S;
    string T;
    cin >> N >> S >> T;

    bool same = true;
    rep(i, N) {
        if (T.at(i) != '*' && S.at(i) != T.at(i)) {
            same = false;
            break;
        }
    }
    cout << (same ? "Yes" : "No") << endl;
}
