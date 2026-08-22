#include <bits/stdc++.h>
using namespace std; 

const int MOD = 998244353;

vector<vector<int>> calc_next(const string &S) {
    int n = S.size();
    vector<vector<int>> res(n + 1, vector<int>(26, n));
    for (int i = n - 1; i >= 0; i--) {
        res[i] = res[i + 1];
        res[i][S[i] - 'a'] = i;
    }
    return res;
}

void add(long long &a, long long b) {
    a += b;
    if (a >= MOD) a -= MOD;
}

int main() {
    string S;
    cin >> S;
    int n = S.size();

    vector<vector<int>> next = calc_next(S);
    vector<long long> dp(n + 1, 0);
    dp.at(0) = 1;

    for (int i = 0; i < n; i++) {
        for (int j = 0; j <26; j++) { 
            int target = next.at(i).at(j);
            if (target < n) add(dp.at(target + 1), dp.at(i));
        }
    }

    long long res = 0;
    for (int i = 1; i <= n; i++) add(res, dp.at(i));
    cout << res << endl;
}