#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
#define one_rep(i, n) for (int i = 1; i <= (n); i++)
using ll = long long;
using namespace std;

int main() {
    int N;
    string S;
    cin >> N >> S;
    S = 'x' + S + 'x';
    int ans = 0;

    rep (i, N) if(S.substr(i, 3) == "xxx") ans++;
    cout << ans << endl;
    
    return 0;
}
