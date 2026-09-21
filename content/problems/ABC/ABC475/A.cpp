#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    string S;
    cin >> S;
    cout << S.at(0);
    for (int i = 1; i < S.size(); i++) {
        cout << 'o' << S.at(i);
    }
    return 0;
}
