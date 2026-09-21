#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N;
    cin >> N;
    vector<long long> ans(3, 0);

    rep(i, N) {
        int A;
        cin >> A;
        int x = (A + 999) / 1000 * 1000 - A;
        ans.at(0) += x / 100;
        ans.at(1) += x / 10 % 10;
        ans.at(2) += x % 10;
    }
    cout << ans.at(2) << ' ' << ans.at(1) << ' ' << ans.at(0) << endl;
}
