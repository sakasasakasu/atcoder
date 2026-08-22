#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N;
    cin >> N;
    vector<int> A(N);
    rep(i, N) cin >> A[i];
    vector<int> B(N);
    rep(i, N) cin >> B[i];

    bool ans = true;

    for (int i = 0; i < N; i++) {
        if (i + 1 != B.at(A.at(i) - 1)) {
            ans = false;
        }
    }

    cout << (ans ? "Yes" : "No") << endl;
}
