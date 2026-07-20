#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N;
    cin >> N;
    bool ans = true;
    rep(i, N) {
        int x;
        cin >> x;
        if (x >= 0) {
            ans = false;
        }
    }
    cout << (ans ? "Yes" : "No") << endl;
}
