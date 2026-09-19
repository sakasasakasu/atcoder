#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N;
    cin >> N;
    vector<int> A(N);
    rep (i, N) cin >> A.at(i);
    int ans = 0;
    for (int i = N / 2; i < N; i++){
        ans += A.at(i);
    } 
    cout << ans;
    return 0;
}
