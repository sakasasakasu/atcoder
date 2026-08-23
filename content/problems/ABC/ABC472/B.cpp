#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N;
    cin >> N;
    vector<int> L(N);
    rep(i, N) cin >> L.at(i);
    long long l = 0;
    long long r = 0;
    long long ans = 1e18;
    long long total = 0;
    rep(i, N) total += L.at(i);

    for (int i = 0; i < N - 1; i++) {
        l += L.at(i);
        r = total - l;
        long long diff = abs(l - r);
        ans = min(ans, diff);
    }

    cout << ans << endl;

}
