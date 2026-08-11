#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;


int main() {
    int M, D;
    cin >> M >> D;
    vector<char> S(M);
    rep (i, M) cin >> S.at(i);
    
    int ans = 0;
    
    for (int i = 0; i < M; i++) {
        bool check = false;
        for (int j = i - D; j <= i + D; j++) {
            if (j >= 0 && j < M && S[j]== 'G') {
                check = true;
                break;
            }
        }
        if (!check) ans++;
    }
    cout << ans;
}
