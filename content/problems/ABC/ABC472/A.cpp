#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    string S;
    cin >> S;
    rep(i, S.size()) {
        if (S.at(i) != 'A') cout << '.';
        else cout << 'A';
    }
}
