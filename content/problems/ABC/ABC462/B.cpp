#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N;
    cin >> N;
    for (int i = 0; i < N; i++) {
        int K;
        cin >> K;
        vector<int> A(K);
        rep(j, K) cin >> A.at(j);
        for (int j = 0; j < K; j++) {
            if (A.at(j) == i + 1) {
                cout << A.at(j);
            }
        }
        cout << endl;
    }
}
