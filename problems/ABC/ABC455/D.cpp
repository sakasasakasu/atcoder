#include <bits/stdc++.h>
#define rep(i,n) for (int i=0; i<(n); i++)
using namespace std;

int main() {
    int N, Q;
    cin >> N >> Q;
    
    vector<int> up(2 * N, -1), down(2 * N, -1);
    
    rep (i, N) {
        up.at(N + i) = i;
        down.at(i) = N + i;
    }

    while (Q--) {
        int c, p;
        cin >> c >> p;
        c--; p--;
        
        int d = down.at(c);
        
        down.at(c) = p;
        up.at(p) = c;
        
        up.at(d) = -1;
    }

    rep (i, N) {
        int x = N + i; 
        int ans = 0;
        while (up.at(x) != -1) {
            x = up.at(x);
            ans++;
        }
        cout << ans << (i == N - 1 ? "" : " ");
    }
    cout << endl;
}
