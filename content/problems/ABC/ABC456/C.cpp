#include <bits/stdc++.h>
using namespace std; 

const int MOD = 998244353;

void add(long long &a, long long b) {
    a += b;
    if (a >= MOD) a -= MOD;
}

int main() {
    string S;
    cin >> S;
    int n = S.size();

    vector<long long> dp(n);
    dp.at(0) = 1;
    long long ans = 1;

    for (int i = 1; i < n; i++) {
        if (S.at(i) != S.at(i - 1)) {
            dp.at(i) = (dp.at(i - 1) + 1) % MOD;
        } else {
            dp.at(i) = 1;
        }
        ans = (ans + dp.at(i)) % MOD;
    }

    cout << ans << endl;
}