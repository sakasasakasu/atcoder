#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N;
    cin >> N;
    vector<int> A(N);
    vector<int> card(101);
    rep (i, N) {
        int t;
        cin >> t;
        card.at(t)++;
    }

    int ans = 0;
    rep(i, 101){
        int t = card.at(i);
        if (card.at(i) % 2 != 0) ans += i;
    } 
    cout << ans;
    return 0;
}
