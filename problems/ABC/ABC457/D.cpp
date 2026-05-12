#include <bits/stdc++.h>
using namespace std;
using ll = long long;

bool isok (ll mid, ll N, ll K, vector<ll> &A) {
    ll nk = 0;
    for (ll i = 1; i <= N; i++) {
        if (A.at(i) < mid) {
            nk += (mid - A.at(i) + i - 1) / i;
            if (nk > K) return false;
        }
    }
    return nk <= K;
}

int main() {
    ll N, K;
    cin >> N >> K;
    
    vector<ll> A(N + 1);
    for (ll i = 1; i <= N; i++) {
        cin >> A.at(i);
    }

    ll ok = 1;
    ll ng = A.at(1) + K + 1;

    while (ng - ok > 1) {
        ll mid = (ok + ng) / 2;
        if (isok(mid, N, K, A)) {
            ok = mid;
        } else {
            ng = mid;
        }
    }
    cout << ok << endl;
}
