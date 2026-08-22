#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using ll = long long;
using namespace std;

int main() {
    int N;
    string S;
    cin >> N >> S;
    
    vector<int> ans;
    rep(i, N) {
        if (S[i] == 'x') {
            ans.push_back(i + 1);
        }
    }
    while (ans.size() < N) ans.push_back(N);

    rep(i, N) cout << ans[i] << endl;
}
