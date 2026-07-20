#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N, M;
    cin >> N >> M;
    vector<int> A(M + 1, -1);
    rep(i, N) {
        int C, S;
        cin >> C >> S;
        if (A.at(C) < S) {
            A.at(C) = S;
        }
    }
    for (int i = 1; i <= M; i++) {
        cout << A.at(i) << endl;
    }
}
