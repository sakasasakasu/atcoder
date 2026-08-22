#include <bits/stdc++.h>
using namespace std; 
using ll = long long;
#define rep(i, n) for (int i = 0; i < (int)(n); i++)
#define all(x) (x).begin(), (x).end()

int main() {
    int N;
    string S;
    cin >> N >> S;
    bool flag = false;
    if (S.at(0) == 'o') {
        flag = true;
    }
        for (int i = 0; i < N; i++) {
            if (S.at(i) == 'o' && flag == true) {
                // Do nothing
            } else {
                flag = false;
                cout << S.at(i);
        }
    }
    cout << endl;
    return 0;
}