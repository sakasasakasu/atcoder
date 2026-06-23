#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    string S;
    cin >> S;
    for (int i = 0; i < S.size(); i++) {
        if (S.at(i) >= '0' && S.at(i) <= '9') {
            cout << S.at(i); 
        }
    }
    cout << endl;
}
